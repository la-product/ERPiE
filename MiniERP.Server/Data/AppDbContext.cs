using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MiniERP.Server.Models;

namespace MiniERP.Server.Data {
    public class AppDbContext : IdentityDbContext<User> {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
        public DbSet<WarehouseItem> WarehouseItems { get; set; }
        public DbSet<Receipt> Receipts { get; set; }
        public DbSet<ReceiptItem> ReceiptItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Invoice>()
                .HasIndex(invoice => invoice.InvoiceNumber)
                .IsUnique();

            modelBuilder.Entity<PurchaseInvoice>()
                .HasIndex(invoice => invoice.PurchaseInvoiceNumber)
                .IsUnique();

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Customer)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Supplier)
                .WithMany()
                .HasForeignKey(i => i.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseInvoice>()
                .HasOne(invoice => invoice.Customer)
                .WithMany()
                .HasForeignKey(invoice => invoice.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PurchaseInvoice>()
                .HasOne(invoice => invoice.Supplier)
                .WithMany()
                .HasForeignKey(invoice => invoice.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .HasOne(item => item.PurchaseInvoice)
                .WithMany(invoice => invoice.Items)
                .HasForeignKey(item => item.PurchaseInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Product)
                .WithMany()
                .HasForeignKey(ii => ii.ProductId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Customer>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(c => c.OwnerId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(invoice => invoice.VatAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(invoice => invoice.TotalAmountExVat)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(invoice => invoice.TotalAmountIncVat)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(item => item.Quantity)
                .HasPrecision(18, 3);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(item => item.UnitPriceExVat)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(item => item.VatRate)
                .HasPrecision(5, 2);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(item => item.TotalPriceExVat)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(item => item.TotalPriceIncVat)
                .HasPrecision(18, 2);
        }

    }
}

