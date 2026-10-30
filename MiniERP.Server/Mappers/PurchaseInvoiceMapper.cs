using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class PurchaseInvoiceMapper
{
    public static PurchaseInvoiceDTO ToDto(PurchaseInvoice invoice) => new()
    {
        Id = invoice.Id,
        PurchaseInvoiceNumber = invoice.PurchaseInvoiceNumber,
        VariableNumber = invoice.VariableNumber,
        IssueDate = invoice.IssueDate,
        TaxableSupplyDate = invoice.TaxableSupplyDate,
        DueDate = invoice.DueDate,
        CustomerId = invoice.CustomerId,
        SupplierId = invoice.SupplierId,
        SupplierName = invoice.Supplier?.Name ?? string.Empty,
        Status = invoice.Status,
        TotalAmountExVat = invoice.TotalAmountExVat,
        VatAmount = invoice.VatAmount,
        TotalAmountIncVat = invoice.TotalAmountIncVat,
        CurrencyCode = invoice.CurrencyCode,
        BankAccount = invoice.BankAccount,
        PaymentMethod = invoice.PaymentMethod,
        Note = invoice.Note
    };

    public static PurchaseInvoiceDetailDTO ToDetailDto(PurchaseInvoice invoice) => new()
    {
        Id = invoice.Id,
        PurchaseInvoiceNumber = invoice.PurchaseInvoiceNumber,
        VariableNumber = invoice.VariableNumber,
        IssueDate = invoice.IssueDate,
        TaxableSupplyDate = invoice.TaxableSupplyDate,
        DueDate = invoice.DueDate,
        CustomerId = invoice.CustomerId,
        SupplierId = invoice.SupplierId,
        Status = invoice.Status,
        TotalAmountExVat = invoice.TotalAmountExVat,
        VatAmount = invoice.VatAmount,
        TotalAmountIncVat = invoice.TotalAmountIncVat,
        CurrencyCode = invoice.CurrencyCode,
        BankAccount = invoice.BankAccount,
        PaymentMethod = invoice.PaymentMethod,
        Note = invoice.Note,
        Customer = invoice.Customer != null ? CustomerMapper.ToDto(invoice.Customer) : null,
        Supplier = invoice.Supplier != null ? CustomerMapper.ToDto(invoice.Supplier) : null,
        Items = invoice.Items.Select(PurchaseInvoiceItemMapper.ToDetailDto).ToList()
    };

    public static PurchaseInvoice ToEntity(CreatePurchaseInvoiceDTO dto) => new()
    {
        PurchaseInvoiceNumber = dto.PurchaseInvoiceNumber,
        IssueDate = dto.IssueDate,
        TaxableSupplyDate = dto.TaxableSupplyDate,
        DueDate = dto.DueDate,
        CustomerId = dto.CustomerId ?? 0,
        SupplierId = dto.SupplierId,
        Status = dto.Status,
        TotalAmountExVat = dto.TotalAmountExVat,
        VatAmount = dto.VatAmount,
        TotalAmountIncVat = dto.TotalAmountIncVat,
        CurrencyCode = dto.CurrencyCode,
        BankAccount = dto.BankAccount,
        VariableNumber = dto.VariableNumber,
        PaymentMethod = dto.PaymentMethod,
        Note = dto.Note
    };

    public static void ApplyUpdate(PurchaseInvoice invoice, UpdatePurchaseInvoiceDTO dto)
    {
        if (dto.PurchaseInvoiceNumber != null) invoice.PurchaseInvoiceNumber = dto.PurchaseInvoiceNumber;
        if (dto.VariableNumber != null) invoice.VariableNumber = dto.VariableNumber;
        if (dto.IssueDate.HasValue) invoice.IssueDate = dto.IssueDate.Value;
        if (dto.TaxableSupplyDate.HasValue) invoice.TaxableSupplyDate = dto.TaxableSupplyDate.Value;
        if (dto.DueDate.HasValue) invoice.DueDate = dto.DueDate.Value;
        if (dto.Status != null) invoice.Status = dto.Status;
        if (dto.TotalAmountExVat.HasValue) invoice.TotalAmountExVat = dto.TotalAmountExVat.Value;
        if (dto.VatAmount.HasValue) invoice.VatAmount = dto.VatAmount.Value;
        if (dto.TotalAmountIncVat.HasValue) invoice.TotalAmountIncVat = dto.TotalAmountIncVat.Value;
        if (dto.CurrencyCode != null) invoice.CurrencyCode = dto.CurrencyCode;
        if (dto.BankAccount != null) invoice.BankAccount = dto.BankAccount;
        if (dto.PaymentMethod != null) invoice.PaymentMethod = dto.PaymentMethod;
        if (dto.Note != null) invoice.Note = dto.Note;
    }
}
