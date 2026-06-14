namespace MiniERP.Server.DTOs;

public class WarehouseItemDTO {
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
}

public class CreateWarehouseItemDTO {
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateWarehouseItemDTO {
    public int? Quantity { get; set; }
}
