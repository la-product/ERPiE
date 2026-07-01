using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class ReceiptItemMapper
{
    public static ReceiptItemDTO ToDto(ReceiptItem i) => new()
    {
        Id = i.Id,
        ProductId = i.ProductId,
        ProductName = i.Product != null
            ? $"{i.Product.Brand} {i.Product.Size} {i.Product.Pattern}"
            : null,
        Quantity = i.Quantity,
        UnitPriceExVat = i.UnitPriceExVat,
        VatRate = i.VatRate,
        TotalPriceExVat = i.TotalPriceExVat,
        TotalPriceIncVat = i.TotalPriceIncVat
    };
}
