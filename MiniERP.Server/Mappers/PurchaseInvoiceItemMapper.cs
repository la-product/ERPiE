using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class PurchaseInvoiceItemMapper
{
    public static PurchaseInvoiceItemDTO ToDto(PurchaseInvoiceItem item) => new()
    {
        Id = item.Id,
        PurchaseInvoiceId = item.PurchaseInvoiceId,
        ProductCode = item.ProductCode,
        Description = item.Description,
        Quantity = item.Quantity,
        UnitPriceExVat = item.UnitPriceExVat,
        VatRate = item.VatRate,
        TotalPriceExVat = item.TotalPriceExVat,
        TotalPriceIncVat = item.TotalPriceIncVat
    };

    public static PurchaseInvoiceItemDetailDTO ToDetailDto(PurchaseInvoiceItem item) => new()
    {
        Id = item.Id,
        PurchaseInvoiceId = item.PurchaseInvoiceId,
        ProductCode = item.ProductCode,
        Description = item.Description,
        Quantity = item.Quantity,
        UnitPriceExVat = item.UnitPriceExVat,
        VatRate = item.VatRate,
        TotalPriceExVat = item.TotalPriceExVat,
        TotalPriceIncVat = item.TotalPriceIncVat
    };

    public static PurchaseInvoiceItem ToEntity(CreatePurchaseInvoiceItemDTO dto) => new()
    {
        ProductCode = dto.ProductCode,
        Description = dto.Description,
        Quantity = dto.Quantity,
        UnitPriceExVat = dto.UnitPriceExVat,
        VatRate = dto.VatRate,
        TotalPriceExVat = dto.TotalPriceExVat,
        TotalPriceIncVat = dto.TotalPriceIncVat
    };
}
