namespace MiniERP.Server.Models;

public class PurchaseInvoice
{
    public int Id { get; set; }

    public string PurchaseInvoiceNumber { get; set; } = string.Empty;
    public string VariableNumber { get; set; } = string.Empty;

    public DateOnly IssueDate { get; set; }
    public DateOnly TaxableSupplyDate { get; set; }
    public DateOnly DueDate { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int SupplierId { get; set; }
    public Customer Supplier { get; set; } = null!;

    public string Status { get; set; } = string.Empty;

    public decimal VatAmount { get; set; }
    public decimal TotalAmountExVat { get; set; }
    public decimal TotalAmountIncVat { get; set; }

    public string CurrencyCode { get; set; } = string.Empty;
    public string BankAccount { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;

    public ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();
}
