using FluentAssertions;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;
using MiniERP.Server.Models;

namespace MiniERP.Tests.Mappers;

public class WarehouseItemMapperTests
{
    // ===========================================================
    // ToDto — denormalizace: product fields se přesunují do DTO
    // ===========================================================

    [Fact]
    public void ToDto_WhenProductExists_DenormalizesProductFields()
    {
        // Arrange — WarehouseItem s přiřazeným produktem
        var warehouseItem = new WarehouseItem
        {
            Id = 1,
            ProductId = 5,
            Quantity = 20,
            UnitPrice = 1850.0,
            Product = new Product
            {
                Id = 5,
                Brand = "Michelin",
                Size = "205/55R16",
                Pattern = "Primacy 4",
                Si = 91,
                Li = "V",
                NetPrice = 1850.0,
                Category = "Letní"
            }
        };

        // Act
        var dto = WarehouseItemMapper.ToDto(warehouseItem);

        // Assert — zkontroluj denormalizované pole z produktu
        dto.Id.Should().Be(1);
        dto.ProductId.Should().Be(5);
        dto.Quantity.Should().Be(20);
        dto.UnitPrice.Should().Be(1850.0);

        // Toto jsou pole přenesená z Product do DTO
        dto.ProductName.Should().Be("Michelin 205/55R16 Primacy 4");
        dto.ProductBrand.Should().Be("Michelin");
        dto.ProductSize.Should().Be("205/55R16");
        dto.ProductPattern.Should().Be("Primacy 4");
        dto.ProductSi.Should().Be(91);
        dto.ProductLi.Should().Be("V");
        dto.ProductNetPrice.Should().Be(1850.0);
        dto.ProductCategory.Should().Be("Letní");
    }

    [Fact]
    public void ToDto_WhenProductIsNull_ReturnsNullProductFields()
    {
        // Arrange — WarehouseItem bez načteného produktu (Product = null)
        // To může nastat, pokud Include(w => w.Product) není v dotazu
        var warehouseItem = new WarehouseItem
        {
            Id = 1,
            ProductId = 5,
            Quantity = 10,
            UnitPrice = 1000.0,
            Product = null
        };

        // Act
        var dto = WarehouseItemMapper.ToDto(warehouseItem);

        // Assert — product fields musí být null/0, ne exception
        dto.ProductName.Should().BeNull();
        dto.ProductBrand.Should().BeNull();
        dto.ProductSi.Should().Be(0);       // výchozí hodnota int
        dto.ProductNetPrice.Should().Be(0); // výchozí hodnota double
        dto.Quantity.Should().Be(10);       // tohle pole je z WarehouseItem, ne z Product
    }

    // ===========================================================
    // ToEntity
    // ===========================================================

    [Fact]
    public void ToEntity_SetsProductIdQuantityAndUnitPrice()
    {
        // Arrange
        var createDto = new CreateWarehouseItemDTO
        {
            ProductId = 5,
            Quantity = 10
        };
        var unitPrice = 1850.0; // cena se bere z produktu, ne z DTO

        // Act
        var entity = WarehouseItemMapper.ToEntity(createDto, unitPrice);

        // Assert
        entity.ProductId.Should().Be(5);
        entity.Quantity.Should().Be(10);
        entity.UnitPrice.Should().Be(1850.0);
    }

    // ===========================================================
    // ApplyUpdate
    // ===========================================================

    [Fact]
    public void ApplyUpdate_WhenQuantityProvided_UpdatesQuantity()
    {
        // Arrange
        var existing = new WarehouseItem { Id = 1, ProductId = 5, Quantity = 20, UnitPrice = 1850.0 };
        var updateDto = new UpdateWarehouseItemDTO { Quantity = 15 };

        // Act
        WarehouseItemMapper.ApplyUpdate(existing, updateDto);

        // Assert
        existing.Quantity.Should().Be(15);
        existing.UnitPrice.Should().Be(1850.0); // nezměněno
    }

    [Fact]
    public void ApplyUpdate_WhenQuantityIsNull_DoesNotChangeQuantity()
    {
        // Arrange
        var existing = new WarehouseItem { Id = 1, Quantity = 20 };
        var updateDto = new UpdateWarehouseItemDTO { Quantity = null };

        // Act
        WarehouseItemMapper.ApplyUpdate(existing, updateDto);

        // Assert
        existing.Quantity.Should().Be(20);
    }
}
