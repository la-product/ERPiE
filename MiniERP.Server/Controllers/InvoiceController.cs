using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Data;
using MiniERP.Server.DTOs;
using MiniERP.Server.Models;
using Microsoft.AspNetCore.Authorization;

namespace MiniERP.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase {
    private readonly AppDbContext _context;

    public InvoiceController(AppDbContext context) {
        _context = context;
    }

    [HttpGet]
    public IActionResult Get() {
        var invoices = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .ToList();

        var dtos = invoices.Select(i => new InvoiceDTO
        {
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

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id) {
        var invoice = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
                .ThenInclude(ii => ii.Product)
            .FirstOrDefault(i => i.Id == id);

        if (invoice == null) return NotFound();

        var dto = new InvoiceDetailDTO
        {
            Id = invoice.Id,
            IssueDate = invoice.IssueDate,
            DueDate = invoice.DueDate,
            Status = invoice.Status,
            CustomerId = invoice.CustomerId,
            TotalAmountExVat = invoice.TotalAmountExVat,
            VatAmount = invoice.VatAmount,
            TotalAmountIncVat = invoice.TotalAmountIncVat,
            CurrencyCode = invoice.CurrencyCode,
            Customer = new CustomerDTO
            {
                Id = invoice.Customer.Id,
                Name = invoice.Customer.Name,
                Street = invoice.Customer.Street,
                City = invoice.Customer.City,
                Zip = invoice.Customer.Zip,
                Email = invoice.Customer.Email,
                Phone = invoice.Customer.Phone
            },
            Items = invoice.Items.Select(ii => new InvoiceItemDetailDTO
            {
                Id = ii.Id,
                InvoiceId = ii.InvoiceId,
                ProductId = ii.ProductId,
                Description = ii.Description,
                Quantity = ii.Quantity,
                UnitPrice = ii.UnitPrice,
                VatRate = ii.VatRate,
                TotalPrice = ii.TotalPrice,
                Product = new ProductDTO
                {
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

        return Ok(dto);
    }

    [HttpPost]
    public IActionResult Post(CreateInvoiceDTO createDto) {
        var invoice = new Invoice
        {
            IssueDate = createDto.IssueDate,
            DueDate = createDto.DueDate,
            CustomerId = createDto.CustomerId,
            Status = createDto.Status,
            TotalAmountExVat = createDto.TotalAmountExVat,
            VatAmount = createDto.VatAmount,
            TotalAmountIncVat = createDto.TotalAmountIncVat,
            CurrencyCode = createDto.CurrencyCode
        };

        // Mapuj items
        foreach (var itemDto in createDto.Items) {
            invoice.Items.Add(new InvoiceItem
            {
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

        var dto = new InvoiceDTO
        {
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

        return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult Put(int id, UpdateInvoiceDTO updateDto) {
        var invoice = _context.Invoices.Find(id);
        if (invoice == null) return NotFound();

        if (updateDto.IssueDate.HasValue)
            invoice.IssueDate = updateDto.IssueDate.Value;
        if (updateDto.DueDate.HasValue)
            invoice.DueDate = updateDto.DueDate.Value;
        if (updateDto.Status != null)
            invoice.Status = updateDto.Status;
        if (updateDto.TotalAmountExVat.HasValue)
            invoice.TotalAmountExVat = updateDto.TotalAmountExVat.Value;
        if (updateDto.VatAmount.HasValue)
            invoice.VatAmount = updateDto.VatAmount.Value;
        if (updateDto.TotalAmountIncVat.HasValue)
            invoice.TotalAmountIncVat = updateDto.TotalAmountIncVat.Value;
        if (updateDto.CurrencyCode != null)
            invoice.CurrencyCode = updateDto.CurrencyCode;

        _context.SaveChanges();

        var dto = new InvoiceDTO
        {
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

        return Ok(dto);
    }

    [HttpPut("{id}/status")]
    public IActionResult UpdateStatus(int id, [FromBody] string status) {
        var invoice = _context.Invoices.Find(id);
        if (invoice == null) return NotFound();

        invoice.Status = status;
        _context.SaveChanges();

        var dto = new InvoiceDTO
        {
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

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id) {
        var invoice = _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefault(i => i.Id == id);

        if (invoice == null) return NotFound();

        _context.Invoices.Remove(invoice);
        _context.SaveChanges();

        return NoContent();
    }
}
