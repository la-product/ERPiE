namespace MiniERP.Server.Models;

public class PurchaseInvoiceItem {
    public int Id { get; set; }
    public int PurchaseInvoiceId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPriceExVat { get; set; }
    public decimal VatRate { get; set; }
    public decimal TotalPriceExVat { get; set; }
    public decimal TotalPriceIncVat { get; set; }
    public PurchaseInvoice PurchaseInvoice { get; set; } = null!;
}
