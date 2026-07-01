using System.Text.Json.Serialization;

namespace MiniERP.Server.DTOs;

/// <summary>
/// Schéma JSON odpovědi Gemini modelu při čtení PDF faktury (viz InvoiceImportService).
/// </summary>
public class InvoiceExtractionItem {
    [JsonPropertyName("productName")]
    public string ProductName { get; set; } = "";

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("unitPriceExVat")]
    public double UnitPriceExVat { get; set; }
}

public class InvoiceExtractionResult {
    [JsonPropertyName("supplierName")]
    public string SupplierName { get; set; } = "";

    [JsonPropertyName("invoiceNumber")]
    public string InvoiceNumber { get; set; } = "";

    [JsonPropertyName("receiptDate")]
    public string ReceiptDate { get; set; } = "";

    [JsonPropertyName("items")]
    public List<InvoiceExtractionItem> Items { get; set; } = new();
}

/// <summary>
/// Výsledek importu vrácený frontendu — extrahovaná data spárovaná s existujícími
/// dodavateli a produkty v databázi, aby šla rovnou předvyplnit do formuláře příjemky.
/// </summary>
public class InvoiceImportItemDTO {
    public string ExtractedProductName { get; set; } = "";
    public int? ProductId { get; set; }
    public string? MatchedProductName { get; set; }
    public int Quantity { get; set; }
    public double UnitPriceExVat { get; set; }
}

public class InvoiceImportDTO {
    public string SupplierName { get; set; } = "";
    public int? SupplierId { get; set; }
    public string InvoiceNumber { get; set; } = "";
    public string? ReceiptDate { get; set; }
    public List<InvoiceImportItemDTO> Items { get; set; } = new();
}
