using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Services;

public class WarehouseService {
    private readonly AppDbContext _context;

    public WarehouseService(AppDbContext context) {
        _context = context;
    }

    public List<WarehouseItemDTO> GetAll() {
        return _context.WarehouseItems
            .Include(w => w.Product)
            .Select(w => new WarehouseItemDTO {
                Id = w.Id,
                ProductId = w.ProductId,
                ProductName = w.Product != null
                    ? $"{w.Product.Brand} {w.Product.Size} {w.Product.Pattern}"
                    : null,
                Quantity = w.Quantity
            }).ToList();
    }

    public WarehouseItemDTO? GetById(int id) {
        var item = _context.WarehouseItems
            .Include(w => w.Product)
            .FirstOrDefault(w => w.Id == id);

        if (item == null) return null;

        return new WarehouseItemDTO {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductName = item.Product != null
                ? $"{item.Product.Brand} {item.Product.Size} {item.Product.Pattern}"
                : null,
            Quantity = item.Quantity
        };
    }

    public WarehouseItemDTO? Create(CreateWarehouseItemDTO createDto) {
        var productExists = _context.Products.Any(p => p.Id == createDto.ProductId);
        if (!productExists) return null;

        var warehouseItem = new WarehouseItem {
            ProductId = createDto.ProductId,
            Quantity = createDto.Quantity
        };

        _context.WarehouseItems.Add(warehouseItem);
        _context.SaveChanges();

        return GetById(warehouseItem.Id);
    }

    public WarehouseItemDTO? Update(int id, UpdateWarehouseItemDTO updateDto) {
        var existing = _context.WarehouseItems.Find(id);
        if (existing == null) return null;

        if (updateDto.Quantity.HasValue) existing.Quantity = updateDto.Quantity.Value;

        _context.SaveChanges();

        return GetById(existing.Id);
    }

    public bool Delete(int id) {
        var item = _context.WarehouseItems.Find(id);
        if (item == null) return false;

        _context.WarehouseItems.Remove(item);
        _context.SaveChanges();
        return true;
    }
}
