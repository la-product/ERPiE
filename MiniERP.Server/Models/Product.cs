namespace MiniERP.Server.Models;

public class Product {
    public int Id { get; set; }
    public string? Size { get; set; }
    public string? Brand { get; set; }
    public string? Pattern { get; set; }
    public int Si { get; set; }
    public string? Li { get;set;  }
    public double NetPrice { get; set; }
    public string? Category { get; set; }

    public List<OrderItem> OrderItems { get; set; } = new();
}
