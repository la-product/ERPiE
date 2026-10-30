using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;

namespace MiniERP.Server.Services;

public class PurchaseInvoiceService
{
    private readonly AppDbContext _context;

    public PurchaseInvoiceService(AppDbContext context)
    {
        _context = context;
    }

    public List<PurchaseInvoiceDTO> GetAll(string? currentUserId, bool isAdmin)
    {
        var query = _context.PurchaseInvoices
            .Include(invoice => invoice.Customer)
            .Include(invoice => invoice.Supplier)
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(invoice => invoice.Customer.OwnerId == currentUserId);
        }

        return query
            .AsEnumerable()
            .Select(PurchaseInvoiceMapper.ToDto)
            .ToList();
    }

    public PurchaseInvoiceDetailDTO? GetById(int id, string? currentUserId, bool isAdmin)
    {
        var invoice = _context.PurchaseInvoices
            .Include(item => item.Customer)
            .Include(item => item.Supplier)
            .Include(item => item.Items)
            .FirstOrDefault(item => item.Id == id);

        if (invoice == null || !CanAccess(invoice, currentUserId, isAdmin))
        {
            return null;
        }

        return PurchaseInvoiceMapper.ToDetailDto(invoice);
    }

    public PurchaseInvoiceDTO? Create(
        CreatePurchaseInvoiceDTO createDto,
        string? currentUserId,
        bool isAdmin,
        out string? errorMessage)
    {
        errorMessage = null;

        if (string.IsNullOrWhiteSpace(createDto.PurchaseInvoiceNumber))
        {
            errorMessage = "Číslo došlé faktury je povinné.";
            return null;
        }

        if (!createDto.CustomerId.HasValue)
        {
            errorMessage = "Odběratel je povinný.";
            return null;
        }

        var customerId = createDto.CustomerId.Value;

        var customerOwnerId = _context.Customers
            .Where(customer => customer.Id == customerId)
            .Select(customer => (string?)customer.OwnerId)
            .FirstOrDefault();

        var supplierExists = _context.Customers
            .Any(customer => customer.Id == createDto.SupplierId);

        if (customerOwnerId == null && !_context.Customers.Any(customer => customer.Id == customerId))
        {
            errorMessage = "Zákazník nebyl v databázi nalezen.";
            return null;
        }

        if (!isAdmin && customerOwnerId != currentUserId)
        {
            errorMessage = "K vybranému zákazníkovi nemáte přístup.";
            return null;
        }

        if (!supplierExists)
        {
            errorMessage = "Firma nebyla v databázi Customers nalezena.";
            return null;
        }

        if (_context.PurchaseInvoices.Any(invoice => invoice.PurchaseInvoiceNumber == createDto.PurchaseInvoiceNumber.Trim()))
        {
            errorMessage = "Došlá faktura s tímto číslem již existuje.";
            return null;
        }

        createDto.PurchaseInvoiceNumber = createDto.PurchaseInvoiceNumber.Trim();
        var invoice = PurchaseInvoiceMapper.ToEntity(createDto);
        if (string.IsNullOrWhiteSpace(invoice.VariableNumber))
        {
            invoice.VariableNumber = invoice.PurchaseInvoiceNumber;
        }

        foreach (var itemDto in createDto.Items)
        {
            invoice.Items.Add(PurchaseInvoiceItemMapper.ToEntity(itemDto));
        }

        _context.PurchaseInvoices.Add(invoice);
        _context.SaveChanges();
        return PurchaseInvoiceMapper.ToDto(invoice);
    }

    public PurchaseInvoiceDetailDTO? Update(
        int id,
        UpdatePurchaseInvoiceDTO updateDto,
        string? currentUserId,
        bool isAdmin)
    {
        var invoice = _context.PurchaseInvoices
            .Include(item => item.Customer)
            .Include(item => item.Supplier)
            .Include(item => item.Items)
            .FirstOrDefault(item => item.Id == id);

        if (invoice == null || !CanAccess(invoice, currentUserId, isAdmin))
        {
            return null;
        }

        PurchaseInvoiceMapper.ApplyUpdate(invoice, updateDto);

        if (updateDto.Items != null)
        {
            _context.PurchaseInvoiceItems.RemoveRange(invoice.Items);
            invoice.Items.Clear();

            foreach (var itemDto in updateDto.Items)
            {
                invoice.Items.Add(PurchaseInvoiceItemMapper.ToEntity(itemDto));
            }
        }

        _context.SaveChanges();
        return PurchaseInvoiceMapper.ToDetailDto(invoice);
    }

    public PurchaseInvoiceDetailDTO? UpdateStatus(
        int id,
        string status,
        string? currentUserId,
        bool isAdmin)
    {
        var invoice = _context.PurchaseInvoices
            .Include(item => item.Customer)
            .Include(item => item.Supplier)
            .Include(item => item.Items)
            .FirstOrDefault(item => item.Id == id);

        if (invoice == null || !CanAccess(invoice, currentUserId, isAdmin))
        {
            return null;
        }

        invoice.Status = status;
        _context.SaveChanges();
        return PurchaseInvoiceMapper.ToDetailDto(invoice);
    }

    public bool Delete(int id, string? currentUserId, bool isAdmin)
    {
        var invoice = _context.PurchaseInvoices
            .Include(item => item.Customer)
            .FirstOrDefault(item => item.Id == id);

        if (invoice == null || !CanAccess(invoice, currentUserId, isAdmin))
        {
            return false;
        }

        _context.PurchaseInvoices.Remove(invoice);
        _context.SaveChanges();
        return true;
    }

    private static bool CanAccess(
        Models.PurchaseInvoice invoice,
        string? currentUserId,
        bool isAdmin)
    {
        return isAdmin || invoice.Customer.OwnerId == currentUserId;
    }
}
