using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;
using MySqlConnector;

namespace MiniERP.Server.Services;

public class InvoiceService {
    private readonly AppDbContext _context;

    public InvoiceService(AppDbContext context) {
        _context = context;
    }

    public string PreviewNextInvoiceNumber() {
        return GenerateNextInvoiceNumber();
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
            .Include(i => i.Supplier)
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

        const int maxAttempts = 5;
        for (var attempt = 1; attempt <= maxAttempts; attempt++) {
            invoice.InvoiceNumber = GenerateNextInvoiceNumber();
            if (string.IsNullOrWhiteSpace(invoice.VariableSymbol)) {
                invoice.VariableSymbol = invoice.InvoiceNumber;
            }

            try {
                _context.SaveChanges();
                return InvoiceMapper.ToDto(invoice);
            } catch (DbUpdateException ex) when (attempt < maxAttempts && IsDuplicateInvoiceNumber(ex)) {
                // Two invoices generated the same number at the same time — try the next one.
            }
        }

        throw new InvalidOperationException("Nepodařilo se vygenerovat unikátní číslo faktury.");
    }

    /// <summary>
    /// Vygeneruje další číslo faktury ve formátu RRRRXXX (rok + pořadové číslo v daném roce),
    /// např. 2026001, 2026002, ...
    /// </summary>
    private string GenerateNextInvoiceNumber() {
        var yearPrefix = DateTime.Now.Year.ToString();

        var lastSequence = _context.Invoices
            .Where(i => i.InvoiceNumber.StartsWith(yearPrefix))
            .Select(i => i.InvoiceNumber)
            .AsEnumerable()
            .Select(number => int.TryParse(number.Substring(yearPrefix.Length), out var sequence) ? sequence : 0)
            .DefaultIfEmpty(0)
            .Max();

        return $"{yearPrefix}{(lastSequence + 1):D3}";
    }

    private static bool IsDuplicateInvoiceNumber(DbUpdateException ex) =>
        ex.InnerException is MySqlException { Number: 1062 };

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
