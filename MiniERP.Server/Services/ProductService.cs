using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;

namespace MiniERP.Server.Services;

public class ProductService {
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context) {
        _context = context;
    }

    public List<ProductDTO> GetAll() {
        return _context.Products
            .Select(p => ProductMapper.ToDto(p))
            .ToList();
    }

    public ProductDetailDTO? GetById(int id) {
        var product = _context.Products
            .Include(p => p.OrderItems)
            .FirstOrDefault(p => p.Id == id);

        return product == null ? null : ProductMapper.ToDetailDto(product);
    }

    public ProductDTO Create(CreateProductDTO createDto) {
        var product = ProductMapper.ToEntity(createDto);
        _context.Products.Add(product);
        _context.SaveChanges();
        return ProductMapper.ToDto(product);
    }

    public ProductDTO? Update(int id, UpdateProductDTO updateDto) {
        var existing = _context.Products.Find(id);
        if (existing == null) return null;

        ProductMapper.ApplyUpdate(existing, updateDto);
        _context.SaveChanges();
        return ProductMapper.ToDto(existing);
    }

    public bool Delete(int id) {
        var product = _context.Products.Find(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        _context.SaveChanges();
        return true;
    }
}
