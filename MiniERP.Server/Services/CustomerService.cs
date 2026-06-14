using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Services;

public class CustomerService {
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context) {
        _context = context;
    }

    public List<CustomerDTO> GetAll() {
        return _context.Customers
            .Select(c => new CustomerDTO {
                Id = c.Id,
                Name = c.Name,
                Street = c.Street,
                City = c.City,
                Zip = c.Zip,
                Email = c.Email,
                Phone = c.Phone,
                Ico = c.Ico,            
                IsSupplier = c.IsSupplier
            }).ToList();
    }

    public CustomerDetailDTO? GetById(int id) {
        var customer = _context.Customers
            .Include(c => c.Orders)
            .FirstOrDefault(c => c.Id == id);

        if (customer == null) return null;

        return new CustomerDetailDTO {
            Id = customer.Id,
            Name = customer.Name,
            Street = customer.Street,
            City = customer.City,
            Zip = customer.Zip,
            Email = customer.Email,
            Phone = customer.Phone,
            Ico = customer.Ico,         
            IsSupplier = customer.IsSupplier,
            Orders = customer.Orders.Select(o => new OrderDTO {
                Id = o.Id,
                CustomerId = o.CustomerId,
                Shipping = o.Shipping,
                Payment = o.Payment,
                CreatedAt = o.CreatedAt,
                TotalPrice = o.TotalPrice,
                Note = o.Note,
                Status = o.Status
            }).ToList()
        };
    }

    public CustomerDTO Create(CreateCustomerDTO createDto) {
        var customer = new Customer {
            Name = createDto.Name,
            Street = createDto.Street,
            City = createDto.City,
            Zip = createDto.Zip,
            Email = createDto.Email,
            Phone = createDto.Phone,
            Ico = createDto.Ico,
            IsSupplier = createDto.IsSupplier
        };

        _context.Customers.Add(customer);
        _context.SaveChanges();

        return new CustomerDTO {
            Id = customer.Id,
            Name = customer.Name,
            Street = customer.Street,
            City = customer.City,
            Zip = customer.Zip,
            Email = customer.Email,
            Phone = customer.Phone,
            Ico = customer.Ico,
            IsSupplier = customer.IsSupplier
        };
    }

    public CustomerDTO? Update(int id, UpdateCustomerDTO updateDto) {
        var existing = _context.Customers.Find(id);
        if (existing == null) return null;

        if (!string.IsNullOrEmpty(updateDto.Name)) existing.Name = updateDto.Name;
        if (!string.IsNullOrEmpty(updateDto.Street)) existing.Street = updateDto.Street;
        if (!string.IsNullOrEmpty(updateDto.City)) existing.City = updateDto.City;
        if (!string.IsNullOrEmpty(updateDto.Zip)) existing.Zip = updateDto.Zip;
        if (!string.IsNullOrEmpty(updateDto.Email)) existing.Email = updateDto.Email;
        if (!string.IsNullOrEmpty(updateDto.Phone)) existing.Phone = updateDto.Phone;
        if (!string.IsNullOrEmpty(updateDto.Ico)) existing.Ico = updateDto.Ico;
        if (updateDto.IsSupplier.HasValue) existing.IsSupplier = updateDto.IsSupplier.Value;

        _context.SaveChanges();

        return new CustomerDTO {
            Id = existing.Id,
            Name = existing.Name,
            Street = existing.Street,
            City = existing.City,
            Zip = existing.Zip,
            Email = existing.Email,
            Phone = existing.Phone,
            Ico = existing.Ico,
            IsSupplier = existing.IsSupplier
   
        };
    }

    public bool Delete(int id) {
        var customer = _context.Customers.Find(id);
        if (customer == null) return false;

        _context.Customers.Remove(customer);
        _context.SaveChanges();
        return true;
    }
}