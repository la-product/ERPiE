using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Logging.Abstractions;

namespace MiniERP.Server.Models;

public class InvoiceItem {
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int? ProductId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal VatRate { get; set; }
    public decimal TotalPrice { get; set; }
    public Invoice Invoice { get; set; } = null!;
    public Product? Product { get; set; }


}
