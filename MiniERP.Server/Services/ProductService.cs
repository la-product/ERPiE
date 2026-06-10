using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Services;

public class ProductService {
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context) {
        _context = context;
    }

    public List<ProductDTO> GetAll() {
        return _context.Products
            .Select(p => new ProductDTO {
                Id = p.Id,
                Size = p.Size,
                Brand = p.Brand,
                Pattern = p.Pattern,
                Si = p.Si,
                Li = p.Li,
                NetPrice = p.NetPrice,
                Stock = p.Stock
            }).ToList();
    }

    public ProductDetailDTO? GetById(int id) {
        var product = _context.Products
            .Include(p => p.OrderItems)
            .FirstOrDefault(p => p.Id == id);

        if (product == null) return null;

        return new ProductDetailDTO {
            Id = product.Id,
            Size = product.Size,
            Brand = product.Brand,
            Pattern = product.Pattern,
            Si = product.Si,
            Li = product.Li,
            NetPrice = product.NetPrice,
            Stock = product.Stock,
            OrderItems = product.OrderItems.Select(oi => new OrderItemDTO {
                Id = oi.Id,
                OrderId = oi.OrderId,
                ProductId = oi.ProductId,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        };
    }

    public ProductDTO Create(CreateProductDTO createDto) {
        var product = new Product {
            Size = createDto.Size,
            Brand = createDto.Brand,
            Pattern = createDto.Pattern,
            Si = createDto.Si,
            Li = createDto.Li,
            NetPrice = createDto.NetPrice,
            Stock = createDto.Stock
        };

        _context.Products.Add(product);
        _context.SaveChanges();

        return new ProductDTO {
            Id = product.Id,
            Size = product.Size,
            Brand = product.Brand,
            Pattern = product.Pattern,
            Si = product.Si,
            Li = product.Li,
            NetPrice = product.NetPrice,
            Stock = product.Stock
        };
    }

    public ProductDTO? Update(int id, UpdateProductDTO updateDto) {
        var existing = _context.Products.Find(id);
        if (existing == null) return null;

        if (updateDto.Size != null) existing.Size = updateDto.Size;
        if (updateDto.Brand != null) existing.Brand = updateDto.Brand;
        if (updateDto.Pattern != null) existing.Pattern = updateDto.Pattern;
        if (updateDto.Si.HasValue) existing.Si = updateDto.Si.Value;
        if (updateDto.Li != null) existing.Li = updateDto.Li;
        if (updateDto.NetPrice.HasValue) existing.NetPrice = updateDto.NetPrice.Value;
        if (updateDto.Stock.HasValue) existing.Stock = updateDto.Stock.Value;

        _context.SaveChanges();

        return new ProductDTO {
            Id = existing.Id,
            Size = existing.Size,
            Brand = existing.Brand,
            Pattern = existing.Pattern,
            Si = existing.Si,
            Li = existing.Li,
            NetPrice = existing.NetPrice,
            Stock = existing.Stock
        };
    }

    public bool Delete(int id) {
        var product = _context.Products.Find(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        _context.SaveChanges();
        return true;
    }
}