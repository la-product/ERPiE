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

    public List<CustomerDTO> GetAll(string? currentUserId, bool isAdmin) {
        var query = _context.Customers.AsQueryable();
        if (!isAdmin) query = query.Where(c => c.OwnerId == currentUserId);

        return query
            .Select(c => CustomerMapper.ToDto(c))
            .ToList();
    }

    public CustomerDetailDTO? GetById(int id, string? currentUserId, bool isAdmin) {
        var customer = _context.Customers
            .Include(c => c.Orders)
            .FirstOrDefault(c => c.Id == id);

        if (customer == null) return null;
        if (!isAdmin && customer.OwnerId != currentUserId) return null;

        return CustomerMapper.ToDetailDto(customer);
    }

    public CustomerDTO Create(CreateCustomerDTO createDto, string? currentUserId) {
        var customer = CustomerMapper.ToEntity(createDto);
        customer.OwnerId = currentUserId;
        _context.Customers.Add(customer);
        _context.SaveChanges();
        return CustomerMapper.ToDto(customer);
    }

    public CustomerDTO? Update(int id, UpdateCustomerDTO updateDto, string? currentUserId, bool isAdmin) {
        var existing = _context.Customers.Find(id);
        if (existing == null) return null;
        if (!isAdmin && existing.OwnerId != currentUserId) return null;

        CustomerMapper.ApplyUpdate(existing, updateDto);
        _context.SaveChanges();
        return CustomerMapper.ToDto(existing);
    }

    public bool Delete(int id, string? currentUserId, bool isAdmin) {
        var customer = _context.Customers.Find(id);
        if (customer == null) return false;
        if (!isAdmin && customer.OwnerId != currentUserId) return false;

        _context.Customers.Remove(customer);
        _context.SaveChanges();
        return true;
    }
}
