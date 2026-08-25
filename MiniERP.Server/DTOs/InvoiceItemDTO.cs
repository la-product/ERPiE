namespace MiniERP.Server.DTOs;

public class InvoiceItemDTO
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int? ProductId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal VatRate { get; set; }
    public decimal TotalPrice { get; set; }
  
}

public class CreateInvoiceItemDTO
{
    public int? ProductId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal VatRate { get; set; }
    public decimal TotalPrice { get; set; }
}

public class UpdateInvoiceItemDTO
{
    public string? Description { get; set; }
    public int? Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? VatRate { get; set; }
    public decimal? TotalPrice { get; set; }
}

public class InvoiceItemDetailDTO
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int? ProductId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal VatRate { get; set; }
    public decimal TotalPrice { get; set; }
    public ProductDTO? Product { get; set; }
}
