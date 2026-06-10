using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
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
            .Select(o => new OrderDTO {
                Id = o.Id,
                CustomerId = o.CustomerId,
                Shipping = o.Shipping,
                Payment = o.Payment,
                CreatedAt = o.CreatedAt,
                TotalPrice = o.TotalPrice,
                Note = o.Note,
                Status = o.Status,
                Customer = new CustomerDTO {
                    Id = o.Customer.Id,
                    Name = o.Customer.Name
                }
            }).ToList();
    }

    public OrderDetailDTO? GetById(int id) {
        var order = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefault(o => o.Id == id);

        if (order == null) return null;

        return new OrderDetailDTO {
            Id = order.Id,
            CustomerId = order.CustomerId,
            Shipping = order.Shipping,
            Payment = order.Payment,
            CreatedAt = order.CreatedAt,
            TotalPrice = order.TotalPrice,
            Note = order.Note,
            Status = order.Status,
            Customer = new CustomerDTO {
                Id = order.Customer.Id,
                Name = order.Customer.Name,
                Street = order.Customer.Street,
                City = order.Customer.City,
                Zip = order.Customer.Zip,
                Email = order.Customer.Email,
                Phone = order.Customer.Phone
            },
            Items = order.Items.Select(i => new OrderItemDetailDTO {
                Id = i.Id,
                OrderId = i.OrderId,
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Product = new ProductDTO {
                    Id = i.Product.Id,
                    Size = i.Product.Size,
                    Brand = i.Product.Brand,
                    Pattern = i.Product.Pattern,
                    Si = i.Product.Si,
                    Li = i.Product.Li,
                    NetPrice = i.Product.NetPrice,
                    Stock = i.Product.Stock
                }
            }).ToList()
        };
    }

    public OrderDTO Create(CreateOrderDTO createDto) {
        var order = new Order {
            CustomerId = createDto.CustomerId,
            Shipping = createDto.Shipping,
            Payment = createDto.Payment,
            TotalPrice = createDto.TotalPrice,
            Note = createDto.Note,
            Status = createDto.Status,
            CreatedAt = DateTimeOffset.UtcNow
        };

        foreach (var itemDto in createDto.Items) {
            order.Items.Add(new OrderItem {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice
            });
        }

        _context.Orders.Add(order);

        foreach (var item in order.Items) {
            var product = _context.Products.Find(item.ProductId);
            if (product != null) {
                product.Stock -= item.Quantity;
            }
        }

        _context.SaveChanges();

        return new OrderDTO {
            Id = order.Id,
            CustomerId = order.CustomerId,
            Shipping = order.Shipping,
            Payment = order.Payment,
            CreatedAt = order.CreatedAt,
            TotalPrice = order.TotalPrice,
            Note = order.Note,
            Status = order.Status
        };
    }

    public OrderDTO? Update(int id, UpdateOrderDTO updateDto) {
        var order = _context.Orders.Find(id);
        if (order == null) return null;

        if (updateDto.Shipping != null) order.Shipping = updateDto.Shipping;
        if (updateDto.Payment != null) order.Payment = updateDto.Payment;
        if (updateDto.TotalPrice.HasValue) order.TotalPrice = updateDto.TotalPrice.Value;
        if (updateDto.Note != null) order.Note = updateDto.Note;
        if (updateDto.Status != null) order.Status = updateDto.Status;

        _context.SaveChanges();

        return new OrderDTO {
            Id = order.Id,
            CustomerId = order.CustomerId,
            Shipping = order.Shipping,
            Payment = order.Payment,
            CreatedAt = order.CreatedAt,
            TotalPrice = order.TotalPrice,
            Note = order.Note,
            Status = order.Status
        };
    }

    public OrderDTO? UpdateStatus(int id, string status) {
        var order = _context.Orders.Find(id);
        if (order == null) return null;

        order.Status = status;
        _context.SaveChanges();

        return new OrderDTO {
            Id = order.Id,
            CustomerId = order.CustomerId,
            Shipping = order.Shipping,
            Payment = order.Payment,
            CreatedAt = order.CreatedAt,
            TotalPrice = order.TotalPrice,
            Note = order.Note,
            Status = order.Status
        };
    }

    public bool Delete(int id) {
        var order = _context.Orders
            .Include(o => o.Items)
            .FirstOrDefault(o => o.Id == id);

        if (order == null) return false;

        foreach (var item in order.Items) {
            var product = _context.Products.Find(item.ProductId);
            if (product != null) {
                product.Stock += item.Quantity;
            }
        }

        _context.Orders.Remove(order);
        _context.SaveChanges();
        return true;
    }
}