using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Services;

public class InvoiceService {
    private readonly AppDbContext _context;

    public InvoiceService(AppDbContext context) {
        _context = context;
    }

    public List<InvoiceDTO> GetAll() {
        return _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .Select(i => new InvoiceDTO {
                Id = i.Id,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                Status = i.Status,
                CustomerId = i.CustomerId,
                CustomerName = i.Customer.Name,
                TotalAmountExVat = i.TotalAmountExVat,
                VatAmount = i.VatAmount,
                TotalAmountIncVat = i.TotalAmountIncVat,
                CurrencyCode = i.CurrencyCode
            }).ToList();
    }

    public InvoiceDetailDTO? GetById(int id) {
        var invoice = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
                .ThenInclude(ii => ii.Product)
            .FirstOrDefault(i => i.Id == id);

        if (invoice == null) return null;

        return new InvoiceDetailDTO {
            Id = invoice.Id,
            IssueDate = invoice.IssueDate,
            DueDate = invoice.DueDate,
            Status = invoice.Status,
            CustomerId = invoice.CustomerId,
            TotalAmountExVat = invoice.TotalAmountExVat,
            VatAmount = invoice.VatAmount,
            TotalAmountIncVat = invoice.TotalAmountIncVat,
            CurrencyCode = invoice.CurrencyCode,
            Customer = new CustomerDTO {
                Id = invoice.Customer.Id,
                Name = invoice.Customer.Name,
                Street = invoice.Customer.Street,
                City = invoice.Customer.City,
                Zip = invoice.Customer.Zip,
                Email = invoice.Customer.Email,
                Phone = invoice.Customer.Phone
            },
            Items = invoice.Items.Select(ii => new InvoiceItemDetailDTO {
                Id = ii.Id,
                InvoiceId = ii.InvoiceId,
                ProductId = ii.ProductId,
                Description = ii.Description,
                Quantity = ii.Quantity,
                UnitPrice = ii.UnitPrice,
                VatRate = ii.VatRate,
                TotalPrice = ii.TotalPrice,
                Product = new ProductDTO {
                    Id = ii.Product.Id,
                    Size = ii.Product.Size,
                    Brand = ii.Product.Brand,
                    Pattern = ii.Product.Pattern,
                    Si = ii.Product.Si,
                    Li = ii.Product.Li,
                    NetPrice = ii.Product.NetPrice,
                    Stock = ii.Product.Stock
                }
            }).ToList()
        };
    }

    public InvoiceDTO Create(CreateInvoiceDTO createDto) {
        var invoice = new Invoice {
            IssueDate = createDto.IssueDate,
            DueDate = createDto.DueDate,
            CustomerId = createDto.CustomerId,
            Status = createDto.Status,
            TotalAmountExVat = createDto.TotalAmountExVat,
            VatAmount = createDto.VatAmount,
            TotalAmountIncVat = createDto.TotalAmountIncVat,
            CurrencyCode = createDto.CurrencyCode
        };

        foreach (var itemDto in createDto.Items) {
            invoice.Items.Add(new InvoiceItem {
                ProductId = itemDto.ProductId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                VatRate = itemDto.VatRate,
                TotalPrice = itemDto.TotalPrice
            });
        }

        _context.Invoices.Add(invoice);
        _context.SaveChanges();

        return new InvoiceDTO {
            Id = invoice.Id,
            IssueDate = invoice.IssueDate,
            DueDate = invoice.DueDate,
            Status = invoice.Status,
            CustomerId = invoice.CustomerId,
            TotalAmountExVat = invoice.TotalAmountExVat,
            VatAmount = invoice.VatAmount,
            TotalAmountIncVat = invoice.TotalAmountIncVat,
            CurrencyCode = invoice.CurrencyCode
        };
    }

    public InvoiceDTO? Update(int id, UpdateInvoiceDTO updateDto) {
        var invoice = _context.Invoices.Find(id);
        if (invoice == null) return null;

        if (updateDto.IssueDate.HasValue) invoice.IssueDate = updateDto.IssueDate.Value;
        if (updateDto.DueDate.HasValue) invoice.DueDate = updateDto.DueDate.Value;
        if (updateDto.Status != null) invoice.Status = updateDto.Status;
        if (updateDto.TotalAmountExVat.HasValue) invoice.TotalAmountExVat = updateDto.TotalAmountExVat.Value;
        if (updateDto.VatAmount.HasValue) invoice.VatAmount = updateDto.VatAmount.Value;
        if (updateDto.TotalAmountIncVat.HasValue) invoice.TotalAmountIncVat = updateDto.TotalAmountIncVat.Value;
        if (updateDto.CurrencyCode != null) invoice.CurrencyCode = updateDto.CurrencyCode;

        _context.SaveChanges();

        return new InvoiceDTO {
            Id = invoice.Id,
            IssueDate = invoice.IssueDate,
            DueDate = invoice.DueDate,
            Status = invoice.Status,
            CustomerId = invoice.CustomerId,
            TotalAmountExVat = invoice.TotalAmountExVat,
            VatAmount = invoice.VatAmount,
            TotalAmountIncVat = invoice.TotalAmountIncVat,
            CurrencyCode = invoice.CurrencyCode
        };
    }

    public InvoiceDTO? UpdateStatus(int id, string status) {
        var invoice = _context.Invoices.Find(id);
        if (invoice == null) return null;

        invoice.Status = status;
        _context.SaveChanges();

        return new InvoiceDTO {
            Id = invoice.Id,
            IssueDate = invoice.IssueDate,
            DueDate = invoice.DueDate,
            Status = invoice.Status,
            CustomerId = invoice.CustomerId,
            TotalAmountExVat = invoice.TotalAmountExVat,
            VatAmount = invoice.VatAmount,
            TotalAmountIncVat = invoice.TotalAmountIncVat,
            CurrencyCode = invoice.CurrencyCode
        };
    }

    public bool Delete(int id) {
        var invoice = _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefault(i => i.Id == id);

        if (invoice == null) return false;

        _context.Invoices.Remove(invoice);
        _context.SaveChanges();
        return true;
    }
}