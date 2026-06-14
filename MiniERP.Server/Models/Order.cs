namespace MiniERP.Server.Models;

public class Order {

    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string? Shipping { get; set; }
    public string? Payment { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public double TotalPrice { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; } = "new";
    public bool WarehouseSynced { get; set; } = false;
    public Customer? Customer { get; set; }
    public List<OrderItem> Items { get; set; } = new();


}
