using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class OrderItemMapper
{
    public static OrderItemDTO ToDto(OrderItem i) => new()
    {
        Id = i.Id,
        OrderId = i.OrderId,
        ProductId = i.ProductId,
        Quantity = i.Quantity,
        UnitPrice = i.UnitPrice
    };

    public static OrderItemDetailDTO ToDetailDto(OrderItem i) => new()
    {
        Id = i.Id,
        OrderId = i.OrderId,
        ProductId = i.ProductId,
        Quantity = i.Quantity,
        UnitPrice = i.UnitPrice,
        Product = i.Product != null ? ProductMapper.ToDto(i.Product) : null
    };

    public static OrderItem ToEntity(CreateOrderItemDTO dto, int orderId = 0) => new()
    {
        OrderId = orderId,
        ProductId = dto.ProductId,
        Quantity = dto.Quantity,
        UnitPrice = dto.UnitPrice
    };

    public static void ApplyUpdate(OrderItem item, UpdateOrderItemDTO dto)
    {
        if (dto.Quantity.HasValue) item.Quantity = dto.Quantity.Value;
        if (dto.UnitPrice.HasValue) item.UnitPrice = dto.UnitPrice.Value;
    }
}
