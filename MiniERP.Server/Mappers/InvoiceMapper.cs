using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class InvoiceMapper
{
    public static InvoiceDTO ToDto(Invoice i) => new()
    {
        Id = i.Id,
        InvoiceNumber = i.InvoiceNumber,
        IssueDate = i.IssueDate,
        TaxableSupplyDate = i.TaxableSupplyDate,
        DueDate = i.DueDate,
        Status = i.Status,
        SupplierId = i.SupplierId,
        CustomerId = i.CustomerId,
        CustomerName = i.Customer?.Name ?? string.Empty,
        TotalAmountExVat = i.TotalAmountExVat,
        VatAmount = i.VatAmount,
        TotalAmountIncVat = i.TotalAmountIncVat,
        CurrencyCode = i.CurrencyCode,
        BankAccount = i.BankAccount,
        VariableSymbol = i.VariableSymbol,
        PaymentMethod = i.PaymentMethod
    };

    public static InvoiceDetailDTO ToDetailDto(Invoice i) => new()
    {
        Id = i.Id,
        InvoiceNumber = i.InvoiceNumber,
        IssueDate = i.IssueDate,
        TaxableSupplyDate = i.TaxableSupplyDate,
        DueDate = i.DueDate,
        Status = i.Status,
        SupplierId = i.SupplierId,
        CustomerId = i.CustomerId,
        TotalAmountExVat = i.TotalAmountExVat,
        VatAmount = i.VatAmount,
        TotalAmountIncVat = i.TotalAmountIncVat,
        CurrencyCode = i.CurrencyCode,
        BankAccount = i.BankAccount,
        VariableSymbol = i.VariableSymbol,
        PaymentMethod = i.PaymentMethod,
        Customer = i.Customer != null ? CustomerMapper.ToDto(i.Customer) : null,
        Supplier = i.Supplier != null ? CustomerMapper.ToDto(i.Supplier) : null,
        Items = i.Items.Select(InvoiceItemMapper.ToDetailDto).ToList()
    };

    public static Invoice ToEntity(CreateInvoiceDTO dto) => new()
    {
        IssueDate = dto.IssueDate,
        TaxableSupplyDate = dto.TaxableSupplyDate,
        DueDate = dto.DueDate,
        CustomerId = dto.CustomerId,
        SupplierId = dto.SupplierId,
        Status = dto.Status,
        TotalAmountExVat = dto.TotalAmountExVat,
        VatAmount = dto.VatAmount,
        TotalAmountIncVat = dto.TotalAmountIncVat,
        CurrencyCode = dto.CurrencyCode,
        BankAccount = dto.BankAccount,
        VariableSymbol = dto.VariableSymbol,
        PaymentMethod = dto.PaymentMethod
    };

    public static void ApplyUpdate(Invoice invoice, UpdateInvoiceDTO dto)
    {
        if (dto.InvoiceNumber != null) invoice.InvoiceNumber = dto.InvoiceNumber;
        if (dto.IssueDate.HasValue) invoice.IssueDate = dto.IssueDate.Value;
        if (dto.TaxableSupplyDate.HasValue) invoice.TaxableSupplyDate = dto.TaxableSupplyDate.Value;
        if (dto.DueDate.HasValue) invoice.DueDate = dto.DueDate.Value;
        if (dto.Status != null) invoice.Status = dto.Status;
        if (dto.TotalAmountExVat.HasValue) invoice.TotalAmountExVat = dto.TotalAmountExVat.Value;
        if (dto.VatAmount.HasValue) invoice.VatAmount = dto.VatAmount.Value;
        if (dto.TotalAmountIncVat.HasValue) invoice.TotalAmountIncVat = dto.TotalAmountIncVat.Value;
        if (dto.CurrencyCode != null) invoice.CurrencyCode = dto.CurrencyCode;
        if (dto.BankAccount != null) invoice.BankAccount = dto.BankAccount;
        if (dto.VariableSymbol != null) invoice.VariableSymbol = dto.VariableSymbol;
        if (dto.PaymentMethod != null) invoice.PaymentMethod = dto.PaymentMethod;
    }
}
