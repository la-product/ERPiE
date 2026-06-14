namespace MiniERP.Server.Models;

public class Receipt {
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public DateTimeOffset ReceiptDate { get; set; }
    public string? InvoiceNumber { get; set; }
    public double TotalAmountExVat { get; set; }
    public double VatAmount { get; set; }
    public double TotalAmountIncVat { get; set; }

    public Customer? Supplier { get; set; }
    public List<ReceiptItem> Items { get; set; } = new();
}
