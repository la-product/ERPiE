using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class WarehouseItemMapper
{
    public static WarehouseItemDTO ToDto(WarehouseItem w) => new()
    {
        Id = w.Id,
        ProductId = w.ProductId,
        ProductName = w.Product != null
            ? $"{w.Product.Brand} {w.Product.Size} {w.Product.Pattern}"
            : null,
        ProductSize = w.Product?.Size,
        ProductBrand = w.Product?.Brand,
        ProductPattern = w.Product?.Pattern,
        ProductSi = w.Product?.Si ?? 0,
        ProductLi = w.Product?.Li,
        ProductNetPrice = w.Product?.NetPrice ?? 0,
        UnitPrice = w.UnitPrice,
        ProductCategory = w.Product?.Category,
        Quantity = w.Quantity
    };

    public static WarehouseItem ToEntity(CreateWarehouseItemDTO dto, double unitPrice) => new()
    {
        ProductId = dto.ProductId,
        Quantity = dto.Quantity,
        UnitPrice = unitPrice
    };

    public static void ApplyUpdate(WarehouseItem item, UpdateWarehouseItemDTO dto)
    {
        if (dto.Quantity.HasValue) item.Quantity = dto.Quantity.Value;
    }
}
