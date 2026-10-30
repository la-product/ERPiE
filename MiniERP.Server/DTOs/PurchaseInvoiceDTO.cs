namespace MiniERP.Server.DTOs;

public class PurchaseInvoiceDTO
{
    public int Id { get; set; }
    public string PurchaseInvoiceNumber { get; set; } = string.Empty;
    public string VariableNumber { get; set; } = string.Empty;
    public DateOnly IssueDate { get; set; }
    public DateOnly TaxableSupplyDate { get; set; }
    public DateOnly DueDate { get; set; }
    public int CustomerId { get; set; }
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmountExVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmountIncVat { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string BankAccount { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
}

public class CreatePurchaseInvoiceDTO
{
    public string PurchaseInvoiceNumber { get; set; } = string.Empty;
    public DateOnly IssueDate { get; set; }
    public DateOnly TaxableSupplyDate { get; set; }
    public DateOnly DueDate { get; set; }
    public int? CustomerId { get; set; }
    public int SupplierId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmountExVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmountIncVat { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string BankAccount { get; set; } = string.Empty;
    public string VariableNumber { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public List<CreatePurchaseInvoiceItemDTO> Items { get; set; } = new();
}

public class UpdatePurchaseInvoiceDTO
{
    public string? PurchaseInvoiceNumber { get; set; }
    public string? VariableNumber { get; set; }
    public DateOnly? IssueDate { get; set; }
    public DateOnly? TaxableSupplyDate { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? Status { get; set; }
    public decimal? TotalAmountExVat { get; set; }
    public decimal? VatAmount { get; set; }
    public decimal? TotalAmountIncVat { get; set; }
    public string? CurrencyCode { get; set; }
    public string? BankAccount { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Note { get; set; }
    public List<CreatePurchaseInvoiceItemDTO>? Items { get; set; }
}

public class PurchaseInvoiceDetailDTO
{
    public int Id { get; set; }
    public string PurchaseInvoiceNumber { get; set; } = string.Empty;
    public string VariableNumber { get; set; } = string.Empty;
    public DateOnly IssueDate { get; set; }
    public DateOnly TaxableSupplyDate { get; set; }
    public DateOnly DueDate { get; set; }
    public int CustomerId { get; set; }
    public int SupplierId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmountExVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmountIncVat { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string BankAccount { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public CustomerDTO? Customer { get; set; }
    public CustomerDTO? Supplier { get; set; }
    public List<PurchaseInvoiceItemDetailDTO> Items { get; set; } = new();
}
