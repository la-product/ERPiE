using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;
using MiniERP.Server.Models;

namespace MiniERP.Server.Services;

public class ReceiptService {
    private readonly AppDbContext _context;
    private const double VatRate = 0.21;

    public ReceiptService(AppDbContext context) {
        _context = context;
    }

    public List<ReceiptDTO> GetAll() {
        return _context.Receipts
            .Include(r => r.Supplier)
            .AsEnumerable()
            .Select(ReceiptMapper.ToDto)
            .ToList();
    }

    public ReceiptDetailDTO? GetById(int id) {
        var receipt = _context.Receipts
            .Include(r => r.Supplier)
            .Include(r => r.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefault(r => r.Id == id);

        return receipt == null ? null : ReceiptMapper.ToDetailDto(receipt);
    }

    public ReceiptDTO? Create(CreateReceiptDTO createDto) {
        var supplierExists = _context.Customers.Any(c => c.Id == createDto.SupplierId && c.IsSupplier);
        if (!supplierExists) return null;

        double totalExVat = 0;

        var receipt = new Receipt {
            SupplierId = createDto.SupplierId,
            ReceiptDate = createDto.ReceiptDate,
            InvoiceNumber = createDto.InvoiceNumber
        };

        foreach (var itemDto in createDto.Items) {
            var totalPriceExVat = itemDto.UnitPriceExVat * itemDto.Quantity;
            var totalPriceIncVat = totalPriceExVat * (1 + VatRate);

            receipt.Items.Add(new ReceiptItem {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPriceExVat = itemDto.UnitPriceExVat,
                VatRate = VatRate * 100,
                TotalPriceExVat = totalPriceExVat,
                TotalPriceIncVat = totalPriceIncVat
            });

            totalExVat += totalPriceExVat;
        }

        receipt.TotalAmountExVat = totalExVat;
        receipt.VatAmount = totalExVat * VatRate;
        receipt.TotalAmountIncVat = totalExVat * (1 + VatRate);

        _context.Receipts.Add(receipt);

        foreach (var item in receipt.Items) {
            var warehouseItem = _context.WarehouseItems
                .FirstOrDefault(w => w.ProductId == item.ProductId);

            if (warehouseItem != null) {
                warehouseItem.Quantity += item.Quantity;
                warehouseItem.UnitPrice = item.UnitPriceExVat;
            } else {
                _context.WarehouseItems.Add(new WarehouseItem {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPriceExVat
                });
            }
        }

        _context.SaveChanges();

        receipt.Supplier = _context.Customers.Find(receipt.SupplierId);
        return ReceiptMapper.ToDto(receipt);
    }

    public bool Delete(int id) {
        var receipt = _context.Receipts
            .Include(r => r.Items)
            .FirstOrDefault(r => r.Id == id);

        if (receipt == null) return false;

        foreach (var item in receipt.Items) {
            var warehouseItem = _context.WarehouseItems
                .FirstOrDefault(w => w.ProductId == item.ProductId);

            if (warehouseItem != null) {
                warehouseItem.Quantity -= item.Quantity;
                if (warehouseItem.Quantity < 0) warehouseItem.Quantity = 0;
            }
        }

        _context.Receipts.Remove(receipt);
        _context.SaveChanges();
        return true;
    }
}
