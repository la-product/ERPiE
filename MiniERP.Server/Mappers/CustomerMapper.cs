using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class CustomerMapper
{
    public static CustomerDTO ToDto(Customer c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Street = c.Street,
        City = c.City,
        Zip = c.Zip,
        Email = c.Email,
        Phone = c.Phone,
        Ico = c.Ico,
        Dic = c.Dic,
        AccountNumber = c.AccountNumber,
        BankCode = c.BankCode,
        IsSupplier = c.IsSupplier,
        Note = c.Note
    };

    public static CustomerDetailDTO ToDetailDto(Customer c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Street = c.Street,
        City = c.City,
        Zip = c.Zip,
        Email = c.Email,
        Phone = c.Phone,
        Ico = c.Ico,
        Dic = c.Dic,
        AccountNumber = c.AccountNumber,
        BankCode = c.BankCode,
        IsSupplier = c.IsSupplier,
        Note = c.Note,
        Orders = c.Orders.Select(OrderMapper.ToDto).ToList()
    };

    public static Customer ToEntity(CreateCustomerDTO dto) => new()
    {
        Name = dto.Name,
        Street = dto.Street,
        City = dto.City,
        Zip = dto.Zip,
        Email = dto.Email,
        Phone = dto.Phone,
        Ico = dto.Ico,
        Dic = dto.Dic,
        AccountNumber = dto.AccountNumber,
        BankCode = dto.BankCode,
        IsSupplier = dto.IsSupplier,
        Note = dto.Note
    };

    public static void ApplyUpdate(Customer customer, UpdateCustomerDTO dto)
    {
        if (!string.IsNullOrEmpty(dto.Name)) customer.Name = dto.Name;
        if (!string.IsNullOrEmpty(dto.Street)) customer.Street = dto.Street;
        if (!string.IsNullOrEmpty(dto.City)) customer.City = dto.City;
        if (!string.IsNullOrEmpty(dto.Zip)) customer.Zip = dto.Zip;
        if (!string.IsNullOrEmpty(dto.Email)) customer.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.Phone)) customer.Phone = dto.Phone;
        if (!string.IsNullOrEmpty(dto.Ico)) customer.Ico = dto.Ico;
        if (!string.IsNullOrEmpty(dto.Dic)) customer.Dic = dto.Dic;
        if (!string.IsNullOrEmpty(dto.AccountNumber)) customer.AccountNumber = dto.AccountNumber;
        if (!string.IsNullOrEmpty(dto.BankCode)) customer.BankCode = dto.BankCode;
        if (dto.IsSupplier.HasValue) customer.IsSupplier = dto.IsSupplier.Value;
        if (dto.Note != null) customer.Note = dto.Note;
    }
}
