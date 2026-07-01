using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class InvoiceMapper
{
    public static InvoiceDTO ToDto(Invoice i) => new()
    {
        Id = i.Id,
        IssueDate = i.IssueDate,
        DueDate = i.DueDate,
        Status = i.Status,
        CustomerId = i.CustomerId,
        CustomerName = i.Customer?.Name ?? string.Empty,
        TotalAmountExVat = i.TotalAmountExVat,
        VatAmount = i.VatAmount,
        TotalAmountIncVat = i.TotalAmountIncVat,
        CurrencyCode = i.CurrencyCode
    };

    public static InvoiceDetailDTO ToDetailDto(Invoice i) => new()
    {
        Id = i.Id,
        IssueDate = i.IssueDate,
        DueDate = i.DueDate,
        Status = i.Status,
        CustomerId = i.CustomerId,
        TotalAmountExVat = i.TotalAmountExVat,
        VatAmount = i.VatAmount,
        TotalAmountIncVat = i.TotalAmountIncVat,
        CurrencyCode = i.CurrencyCode,
        Customer = i.Customer != null ? CustomerMapper.ToDto(i.Customer) : null,
        Items = i.Items.Select(InvoiceItemMapper.ToDetailDto).ToList()
    };

    public static Invoice ToEntity(CreateInvoiceDTO dto) => new()
    {
        IssueDate = dto.IssueDate,
        DueDate = dto.DueDate,
        CustomerId = dto.CustomerId,
        Status = dto.Status,
        TotalAmountExVat = dto.TotalAmountExVat,
        VatAmount = dto.VatAmount,
        TotalAmountIncVat = dto.TotalAmountIncVat,
        CurrencyCode = dto.CurrencyCode
    };

    public static void ApplyUpdate(Invoice invoice, UpdateInvoiceDTO dto)
    {
        if (dto.IssueDate.HasValue) invoice.IssueDate = dto.IssueDate.Value;
        if (dto.DueDate.HasValue) invoice.DueDate = dto.DueDate.Value;
        if (dto.Status != null) invoice.Status = dto.Status;
        if (dto.TotalAmountExVat.HasValue) invoice.TotalAmountExVat = dto.TotalAmountExVat.Value;
        if (dto.VatAmount.HasValue) invoice.VatAmount = dto.VatAmount.Value;
        if (dto.TotalAmountIncVat.HasValue) invoice.TotalAmountIncVat = dto.TotalAmountIncVat.Value;
        if (dto.CurrencyCode != null) invoice.CurrencyCode = dto.CurrencyCode;
    }
}
