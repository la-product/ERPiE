namespace MiniERP.Server.Models;

public class ReceiptItem {
    public int Id { get; set; }
    public int ReceiptId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public double UnitPriceExVat { get; set; }
    public double VatRate { get; set; }
    public double TotalPriceExVat { get; set; }
    public double TotalPriceIncVat { get; set; }

    public Receipt? Receipt { get; set; }
    public Product? Product { get; set; }
}
