using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class InvoiceItemMapper
{
    public static InvoiceItemDTO ToDto(InvoiceItem i) => new()
    {
        Id = i.Id,
        InvoiceId = i.InvoiceId,
        ProductId = i.ProductId,
        Description = i.Description,
        Quantity = i.Quantity,
        UnitPrice = i.UnitPrice,
        VatRate = i.VatRate,
        TotalPrice = i.TotalPrice
    };

    public static InvoiceItemDetailDTO ToDetailDto(InvoiceItem i) => new()
    {
        Id = i.Id,
        InvoiceId = i.InvoiceId,
        ProductId = i.ProductId,
        Description = i.Description,
        Quantity = i.Quantity,
        UnitPrice = i.UnitPrice,
        VatRate = i.VatRate,
        TotalPrice = i.TotalPrice,
        Product = i.Product != null ? ProductMapper.ToDto(i.Product) : null
    };

    public static InvoiceItem ToEntity(CreateInvoiceItemDTO dto) => new()
    {
        ProductId = dto.ProductId,
        Description = dto.Description,
        Quantity = dto.Quantity,
        UnitPrice = dto.UnitPrice,
        VatRate = dto.VatRate,
        TotalPrice = dto.TotalPrice
    };

    public static void ApplyUpdate(InvoiceItem item, UpdateInvoiceItemDTO dto)
    {
        if (dto.Description != null) item.Description = dto.Description;
        if (dto.Quantity.HasValue) item.Quantity = dto.Quantity.Value;
        if (dto.UnitPrice.HasValue) item.UnitPrice = dto.UnitPrice.Value;
        if (dto.VatRate.HasValue) item.VatRate = dto.VatRate.Value;
        if (dto.TotalPrice.HasValue) item.TotalPrice = dto.TotalPrice.Value;
    }
}
