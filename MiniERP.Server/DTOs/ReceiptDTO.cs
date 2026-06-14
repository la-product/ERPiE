namespace MiniERP.Server.DTOs;

public class ReceiptDTO {
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public DateTimeOffset ReceiptDate { get; set; }
    public string? InvoiceNumber { get; set; }
    public double TotalAmountExVat { get; set; }
    public double VatAmount { get; set; }
    public double TotalAmountIncVat { get; set; }
}

public class ReceiptDetailDTO {
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public DateTimeOffset ReceiptDate { get; set; }
    public string? InvoiceNumber { get; set; }
    public double TotalAmountExVat { get; set; }
    public double VatAmount { get; set; }
    public double TotalAmountIncVat { get; set; }
    public List<ReceiptItemDTO> Items { get; set; } = new();
}

public class ReceiptItemDTO {
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
    public double UnitPriceExVat { get; set; }
    public double VatRate { get; set; }
    public double TotalPriceExVat { get; set; }
    public double TotalPriceIncVat { get; set; }
}

public class CreateReceiptDTO {
    public int SupplierId { get; set; }
    public DateTimeOffset ReceiptDate { get; set; }
    public string? InvoiceNumber { get; set; }
    public List<CreateReceiptItemDTO> Items { get; set; } = new();
}

public class CreateReceiptItemDTO {
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public double UnitPriceExVat { get; set; }
}
