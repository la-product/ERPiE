using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;

namespace MiniERP.Server.Services;

public class CustomerService {
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context) {
        _context = context;
    }

    public List<CustomerDTO> GetAll() {
        return _context.Customers
            .Select(c => CustomerMapper.ToDto(c))
            .ToList();
    }

    public CustomerDetailDTO? GetById(int id) {
        var customer = _context.Customers
            .Include(c => c.Orders)
            .FirstOrDefault(c => c.Id == id);

        return customer == null ? null : CustomerMapper.ToDetailDto(customer);
    }

    public CustomerDTO Create(CreateCustomerDTO createDto) {
        var customer = CustomerMapper.ToEntity(createDto);
        _context.Customers.Add(customer);
        _context.SaveChanges();
        return CustomerMapper.ToDto(customer);
    }

    public CustomerDTO? Update(int id, UpdateCustomerDTO updateDto) {
        var existing = _context.Customers.Find(id);
        if (existing == null) return null;

        CustomerMapper.ApplyUpdate(existing, updateDto);
        _context.SaveChanges();
        return CustomerMapper.ToDto(existing);
    }

    public bool Delete(int id) {
        var customer = _context.Customers.Find(id);
        if (customer == null) return false;

        _context.Customers.Remove(customer);
        _context.SaveChanges();
        return true;
    }
}
