using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;

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
            .AsEnumerable()
            .Select(InvoiceMapper.ToDto)
            .ToList();
    }

    public InvoiceDetailDTO? GetById(int id) {
        var invoice = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
                .ThenInclude(ii => ii.Product)
            .FirstOrDefault(i => i.Id == id);

        return invoice == null ? null : InvoiceMapper.ToDetailDto(invoice);
    }

    public InvoiceDTO Create(CreateInvoiceDTO createDto) {
        var invoice = InvoiceMapper.ToEntity(createDto);

        foreach (var itemDto in createDto.Items) {
            invoice.Items.Add(InvoiceItemMapper.ToEntity(itemDto));
        }

        _context.Invoices.Add(invoice);
        _context.SaveChanges();
        return InvoiceMapper.ToDto(invoice);
    }

    public InvoiceDTO? Update(int id, UpdateInvoiceDTO updateDto) {
        var invoice = _context.Invoices.Find(id);
        if (invoice == null) return null;

        InvoiceMapper.ApplyUpdate(invoice, updateDto);
        _context.SaveChanges();
        return InvoiceMapper.ToDto(invoice);
    }

    public InvoiceDTO? UpdateStatus(int id, string status) {
        var invoice = _context.Invoices.Find(id);
        if (invoice == null) return null;

        invoice.Status = status;
        _context.SaveChanges();
        return InvoiceMapper.ToDto(invoice);
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
