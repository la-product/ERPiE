using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class ReceiptMapper
{
    public static ReceiptDTO ToDto(Receipt r) => new()
    {
        Id = r.Id,
        SupplierId = r.SupplierId,
        SupplierName = r.Supplier?.Name,
        ReceiptDate = r.ReceiptDate,
        InvoiceNumber = r.InvoiceNumber,
        TotalAmountExVat = r.TotalAmountExVat,
        VatAmount = r.VatAmount,
        TotalAmountIncVat = r.TotalAmountIncVat
    };

    public static ReceiptDetailDTO ToDetailDto(Receipt r) => new()
    {
        Id = r.Id,
        SupplierId = r.SupplierId,
        SupplierName = r.Supplier?.Name,
        ReceiptDate = r.ReceiptDate,
        InvoiceNumber = r.InvoiceNumber,
        TotalAmountExVat = r.TotalAmountExVat,
        VatAmount = r.VatAmount,
        TotalAmountIncVat = r.TotalAmountIncVat,
        Items = r.Items.Select(ReceiptItemMapper.ToDto).ToList()
    };
}
