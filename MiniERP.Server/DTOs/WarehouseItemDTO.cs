namespace MiniERP.Server.DTOs;

public class WarehouseItemDTO {
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductSize { get; set; }
    public string? ProductBrand { get; set; }
    public string? ProductPattern { get; set; }
    public int ProductSi { get; set; }
    public string? ProductLi { get; set; }
    public double ProductNetPrice { get; set; }
    public string? ProductCategory { get; set; }
    public int Quantity { get; set; }
}

public class CreateWarehouseItemDTO {
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateWarehouseItemDTO {
    public int? Quantity { get; set; }
}
