using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class OrderMapper
{
    public static OrderDTO ToDto(Order o) => new()
    {
        Id = o.Id,
        CustomerId = o.CustomerId,
        Shipping = o.Shipping,
        Payment = o.Payment,
        CreatedAt = o.CreatedAt,
        TotalPrice = o.TotalPrice,
        Note = o.Note,
        Status = o.Status,
        Customer = o.Customer != null ? CustomerMapper.ToDto(o.Customer) : null
    };

    public static OrderDetailDTO ToDetailDto(Order o) => new()
    {
        Id = o.Id,
        CustomerId = o.CustomerId,
        Shipping = o.Shipping,
        Payment = o.Payment,
        CreatedAt = o.CreatedAt,
        TotalPrice = o.TotalPrice,
        Note = o.Note,
        Status = o.Status,
        Customer = o.Customer != null ? CustomerMapper.ToDto(o.Customer) : null,
        Items = o.Items.Select(OrderItemMapper.ToDetailDto).ToList()
    };

    public static Order ToEntity(CreateOrderDTO dto) => new()
    {
        CustomerId = dto.CustomerId,
        Shipping = dto.Shipping,
        Payment = dto.Payment,
        TotalPrice = dto.TotalPrice,
        Note = dto.Note,
        Status = dto.Status,
        CreatedAt = DateTimeOffset.UtcNow
    };

    public static void ApplyUpdate(Order order, UpdateOrderDTO dto)
    {
        if (dto.Shipping != null) order.Shipping = dto.Shipping;
        if (dto.Payment != null) order.Payment = dto.Payment;
        if (dto.TotalPrice.HasValue) order.TotalPrice = dto.TotalPrice.Value;
        if (dto.Note != null) order.Note = dto.Note;
        if (dto.Status != null) order.Status = dto.Status;
    }
}
