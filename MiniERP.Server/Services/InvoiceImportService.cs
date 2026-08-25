using System.Text.Json;
using Google.GenAI;
using Google.GenAI.Types;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Models;
using SchemaType = Google.GenAI.Types.Type;

namespace MiniERP.Server.Services;

/// <summary>
/// Čte PDF faktury přes Google Gemini API a extrahovaná data spáruje s existujícími
/// dodavateli a produkty, aby šla předvyplnit do formuláře příjemky.
/// </summary>
public class InvoiceImportService {
    private readonly AppDbContext _context;
    private const string Model = "gemini-2.5-flash";
    private const double MatchThreshold = 0.4;

    private static readonly Schema InvoiceSchema = new() {
        Type = SchemaType.Object,
        Properties = new Dictionary<string, Schema> {
            ["supplierName"] = new Schema {
                Type = SchemaType.String,
                Description = "Přesný název dodavatele (firma, která fakturu vystavila)",
            },
            ["invoiceNumber"] = new Schema {
                Type = SchemaType.String,
                Description = "Číslo faktury / dokladu",
            },
            ["receiptDate"] = new Schema {
                Type = SchemaType.String,
                Description = "Datum vystavení nebo přijetí faktury ve formátu YYYY-MM-DD",
            },
            ["items"] = new Schema {
                Type = SchemaType.Array,
                Items = new Schema {
                    Type = SchemaType.Object,
                    Properties = new Dictionary<string, Schema> {
                        ["productName"] = new Schema {
                            Type = SchemaType.String,
                            Description = "Název produktu nebo popis položky přesně tak, jak je uveden na faktuře",
                        },
                        ["quantity"] = new Schema { Type = SchemaType.Integer, Description = "Množství kusů" },
                        ["unitPriceExVat"] = new Schema { Type = SchemaType.Number, Description = "Jednotková cena bez DPH" },
                    },
                    Required = new List<string> { "productName", "quantity", "unitPriceExVat" },
                },
            },
        },
        Required = new List<string> { "supplierName", "invoiceNumber", "receiptDate", "items" },
    };

    public InvoiceImportService(AppDbContext context) {
        _context = context;
    }

    public async Task<InvoiceImportDTO> ExtractFromPdfAsync(byte[] pdfBytes) {
        var client = new Client();

        var content = new Content {
            Role = "user",
            Parts = new List<Part> {
                Part.FromBytes(pdfBytes, "application/pdf"),
                Part.FromText(
                    "Toto je faktura od dodavatele. Přečti z ní název dodavatele, " +
                    "číslo faktury, datum a seznam položek s množstvím a jednotkovou cenou bez DPH."
                ),
            },
        };

        var response = await client.Models.GenerateContentAsync(
            model: Model,
            contents: content,
            config: new GenerateContentConfig {
                ResponseMimeType = "application/json",
                ResponseSchema = InvoiceSchema,
            }
        );

        var text = response.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
        if (string.IsNullOrWhiteSpace(text)) {
            throw new InvalidOperationException("Z faktury se nepodařilo přečíst žádná data.");
        }

        var extracted = JsonSerializer.Deserialize<InvoiceExtractionResult>(text)
            ?? throw new InvalidOperationException("Odpověď modelu se nepodařilo zpracovat.");

        return MatchToExistingData(extracted);
    }

    private InvoiceImportDTO MatchToExistingData(InvoiceExtractionResult extracted) {
        var suppliers = _context.Customers.Where(c => c.IsSupplier).ToList();
        var matchedSupplier = FindBestMatch(extracted.SupplierName, suppliers, s => s.Name);

        var products = _context.Products.ToList();

        DateTimeOffset? parsedDate = DateTimeOffset.TryParse(extracted.ReceiptDate, out var d) ? d : null;

        return new InvoiceImportDTO {
            SupplierName = extracted.SupplierName,
            SupplierId = matchedSupplier?.Id,
            InvoiceNumber = extracted.InvoiceNumber,
            ReceiptDate = parsedDate?.ToString("yyyy-MM-dd"),
            Items = extracted.Items.Select(item => {
                var matchedProduct = FindBestMatch(item.ProductName, products, ProductDisplayText);
                return new InvoiceImportItemDTO {
                    ExtractedProductName = item.ProductName,
                    ProductId = matchedProduct?.Id,
                    MatchedProductName = matchedProduct != null ? ProductDisplayText(matchedProduct) : null,
                    Quantity = item.Quantity,
                    UnitPriceExVat = item.UnitPriceExVat,
                };
            }).ToList(),
        };
    }

    private static string ProductDisplayText(Product p) => $"{p.Size} {p.Brand} {p.Pattern}".Trim();

    private static T? FindBestMatch<T>(string query, List<T> candidates, Func<T, string> textSelector)
        where T : class {
        if (string.IsNullOrWhiteSpace(query)) return null;
        var normalizedQuery = Normalize(query);

        return candidates
            .Select(c => new { Item = c, Text = Normalize(textSelector(c)) })
            .Where(x => !string.IsNullOrWhiteSpace(x.Text))
            .Select(x => new { x.Item, Score = SimilarityScore(normalizedQuery, x.Text) })
            .Where(x => x.Score >= MatchThreshold)
            .OrderByDescending(x => x.Score)
            .Select(x => x.Item)
            .FirstOrDefault();
    }

    private static string Normalize(string s) => s.Trim().ToLowerInvariant();

    private static double SimilarityScore(string a, string b) {
        if (a == b) return 1.0;
        if (a.Length == 0 || b.Length == 0) return 0;
        if (b.Contains(a) || a.Contains(b)) return 0.8;

        var tokensA = a.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet();
        var tokensB = b.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet();
        if (tokensA.Count == 0 || tokensB.Count == 0) return 0;

        var overlap = tokensA.Intersect(tokensB).Count();
        return (double)overlap / Math.Max(tokensA.Count, tokensB.Count);
    }
}
