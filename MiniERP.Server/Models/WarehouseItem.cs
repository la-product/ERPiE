namespace MiniERP.Server.Models;

public class WarehouseItem {
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public double UnitPrice { get; set; }

    public Product? Product { get; set; }
}
