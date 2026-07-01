using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;
using MiniERP.Server.Models;

namespace MiniERP.Server.Services;

public class OrderService {
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context) {
        _context = context;
    }

    public List<OrderDTO> GetAll() {
        return _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsEnumerable()
            .Select(OrderMapper.ToDto)
            .ToList();
    }

    public OrderDetailDTO? GetById(int id) {
        var order = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefault(o => o.Id == id);

        return order == null ? null : OrderMapper.ToDetailDto(order);
    }

    public OrderDTO Create(CreateOrderDTO createDto) {
        var order = OrderMapper.ToEntity(createDto);

        foreach (var itemDto in createDto.Items) {
            order.Items.Add(OrderItemMapper.ToEntity(itemDto));
        }

        order.WarehouseSynced = true;
        _context.Orders.Add(order);
        _context.SaveChanges();

        foreach (var item in order.Items) {
            var warehouseItem = _context.WarehouseItems
                .FirstOrDefault(w => w.ProductId == item.ProductId);
            if (warehouseItem != null) {
                warehouseItem.Quantity -= item.Quantity;
                if (warehouseItem.Quantity < 0) warehouseItem.Quantity = 0;
            }
        }

        _context.SaveChanges();

        return OrderMapper.ToDto(order);
    }

    public OrderDTO? Update(int id, UpdateOrderDTO updateDto) {
        var order = _context.Orders.Find(id);
        if (order == null) return null;

        OrderMapper.ApplyUpdate(order, updateDto);
        _context.SaveChanges();
        return OrderMapper.ToDto(order);
    }

    public OrderDTO? UpdateStatus(int id, string status) {
        var order = _context.Orders.Find(id);
        if (order == null) return null;

        order.Status = status;
        _context.SaveChanges();
        return OrderMapper.ToDto(order);
    }

    public void SyncWarehouse() {
        var unsynced = _context.Orders
            .Include(o => o.Items)
            .Where(o => !o.WarehouseSynced)
            .ToList();

        foreach (var order in unsynced) {
            foreach (var item in order.Items) {
                var warehouseItem = _context.WarehouseItems
                    .FirstOrDefault(w => w.ProductId == item.ProductId);
                if (warehouseItem != null) {
                    warehouseItem.Quantity -= item.Quantity;
                    if (warehouseItem.Quantity < 0) warehouseItem.Quantity = 0;
                }
            }
            order.WarehouseSynced = true;
        }

        if (unsynced.Count > 0)
            _context.SaveChanges();
    }

    public bool Delete(int id) {
        var order = _context.Orders
            .Include(o => o.Items)
            .FirstOrDefault(o => o.Id == id);

        if (order == null) return false;

        foreach (var item in order.Items) {
            var warehouseItem = _context.WarehouseItems
                .FirstOrDefault(w => w.ProductId == item.ProductId);
            if (warehouseItem != null) {
                warehouseItem.Quantity += item.Quantity;
            }
        }

        _context.Orders.Remove(order);
        _context.SaveChanges();
        return true;
    }
}
