using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;

namespace MiniERP.Server.Services;

public class WarehouseService {
    private readonly AppDbContext _context;

    public WarehouseService(AppDbContext context) {
        _context = context;
    }

    public List<WarehouseItemDTO> GetAll() {
        return _context.WarehouseItems
            .Include(w => w.Product)
            .AsEnumerable()
            .Select(WarehouseItemMapper.ToDto)
            .ToList();
    }

    public WarehouseItemDTO? GetById(int id) {
        var item = _context.WarehouseItems
            .Include(w => w.Product)
            .FirstOrDefault(w => w.Id == id);

        return item == null ? null : WarehouseItemMapper.ToDto(item);
    }

    public WarehouseItemDTO? Create(CreateWarehouseItemDTO createDto) {
        var product = _context.Products.FirstOrDefault(p => p.Id == createDto.ProductId);
        if (product == null) return null;

        var warehouseItem = WarehouseItemMapper.ToEntity(createDto, product.NetPrice);
        _context.WarehouseItems.Add(warehouseItem);
        _context.SaveChanges();

        return GetById(warehouseItem.Id);
    }

    public WarehouseItemDTO? Update(int id, UpdateWarehouseItemDTO updateDto) {
        var existing = _context.WarehouseItems.Find(id);
        if (existing == null) return null;

        WarehouseItemMapper.ApplyUpdate(existing, updateDto);
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
