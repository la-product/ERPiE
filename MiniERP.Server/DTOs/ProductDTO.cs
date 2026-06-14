namespace MiniERP.Server.DTOs;

public class ProductDTO
{
    public int Id { get; set; }
    public string? Size { get; set; }
    public string? Brand { get; set; }
    public string? Pattern { get; set; }
    public int Si { get; set; }
    public string? Li { get; set; }
    public double NetPrice { get; set; }
    public string? Category { get; set; }
}

public class CreateProductDTO
{
    public string? Size { get; set; }
    public string? Brand { get; set; }
    public string? Pattern { get; set; }
    public int Si { get; set; }
    public string? Li { get; set; }
    public double NetPrice { get; set; }
    public string? Category { get; set; }
}

public class UpdateProductDTO
{
    public string? Size { get; set; }
    public string? Brand { get; set; }
    public string? Pattern { get; set; }
    public int? Si { get; set; }
    public string? Li { get; set; }
    public double? NetPrice { get; set; }
    public string? Category { get; set; }
}

public class ProductDetailDTO
{
    public int Id { get; set; }
    public string? Size { get; set; }
    public string? Brand { get; set; }
    public string? Pattern { get; set; }
    public int Si { get; set; }
    public string? Li { get; set; }
    public double NetPrice { get; set; }
    public string? Category { get; set; }
    public List<OrderItemDTO> OrderItems { get; set; } = new();
}
