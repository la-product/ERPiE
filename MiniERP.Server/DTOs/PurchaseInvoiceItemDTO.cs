namespace MiniERP.Server.DTOs;

public class PurchaseInvoiceItemDTO
{
    public int Id { get; set; }
    public int PurchaseInvoiceId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPriceExVat { get; set; }
    public decimal VatRate { get; set; }
    public decimal TotalPriceExVat { get; set; }
    public decimal TotalPriceIncVat { get; set; }
}

public class CreatePurchaseInvoiceItemDTO
{
    public string ProductCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPriceExVat { get; set; }
    public decimal VatRate { get; set; }
    public decimal TotalPriceExVat { get; set; }
    public decimal TotalPriceIncVat { get; set; }
}

public class PurchaseInvoiceItemDetailDTO
{
    public int Id { get; set; }
    public int PurchaseInvoiceId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPriceExVat { get; set; }
    public decimal VatRate { get; set; }
    public decimal TotalPriceExVat { get; set; }
    public decimal TotalPriceIncVat { get; set; }
}
