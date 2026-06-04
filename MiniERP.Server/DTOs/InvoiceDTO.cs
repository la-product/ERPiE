namespace MiniERP.Server.DTOs;

public class InvoiceDTO
{
    public int Id { get; set; }
    public DateOnly IssueDate { get; set; }
    public DateOnly DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmountExVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmountIncVat { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
}

public class CreateInvoiceDTO
{
    public DateOnly IssueDate { get; set; }
    public DateOnly DueDate { get; set; }
    public int CustomerId { get; set; }
    public decimal TotalAmountExVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmountIncVat { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<CreateInvoiceItemDTO> Items { get; set; } = new();
}

public class UpdateInvoiceDTO
{
    public DateOnly? IssueDate { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? Status { get; set; }
    public decimal? TotalAmountExVat { get; set; }
    public decimal? VatAmount { get; set; }
    public decimal? TotalAmountIncVat { get; set; }
    public string? CurrencyCode { get; set; }
}

public class InvoiceDetailDTO
{
    public int Id { get; set; }
    public DateOnly IssueDate { get; set; }
    public DateOnly DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public decimal TotalAmountExVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmountIncVat { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public CustomerDTO? Customer { get; set; }
    public List<InvoiceItemDetailDTO> Items { get; set; } = new();
}
