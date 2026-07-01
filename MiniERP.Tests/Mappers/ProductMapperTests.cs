using FluentAssertions;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;
using MiniERP.Server.Models;

namespace MiniERP.Tests.Mappers;

public class ProductMapperTests
{
    // ===========================================================
    // ToDto
    // ===========================================================

    [Fact]
    public void ToDto_MapsAllFields()
    {
        // Arrange
        var product = new Product
        {
            Id = 5,
            Brand = "Michelin",
            Size = "205/55R16",
            Pattern = "Primacy 4",
            Si = 91,
            Li = "V",
            NetPrice = 1850.0,
            Category = "Letní"
        };

        // Act
        var dto = ProductMapper.ToDto(product);

        // Assert
        dto.Id.Should().Be(5);
        dto.Brand.Should().Be("Michelin");
        dto.Size.Should().Be("205/55R16");
        dto.Pattern.Should().Be("Primacy 4");
        dto.Si.Should().Be(91);
        dto.Li.Should().Be("V");
        dto.NetPrice.Should().Be(1850.0);
        dto.Category.Should().Be("Letní");
    }

    // ===========================================================
    // ToEntity
    // ===========================================================

    [Fact]
    public void ToEntity_MapsAllFields()
    {
        // Arrange
        var createDto = new CreateProductDTO
        {
            Brand = "Continental",
            Size = "225/45R17",
            Pattern = "EcoContact 6",
            Si = 94,
            Li = "W",
            NetPrice = 2100.0,
            Category = "Letní"
        };

        // Act
        var entity = ProductMapper.ToEntity(createDto);

        // Assert
        entity.Brand.Should().Be("Continental");
        entity.Size.Should().Be("225/45R17");
        entity.Pattern.Should().Be("EcoContact 6");
        entity.NetPrice.Should().Be(2100.0);
    }

    // ===========================================================
    // ApplyUpdate — testujeme chování null polí
    // ===========================================================

    [Fact]
    public void ApplyUpdate_WhenOnlyNetPriceProvided_UpdatesOnlyNetPrice()
    {
        // Arrange — produkt s více poli
        var existing = new Product
        {
            Id = 1,
            Brand = "Michelin",
            Size = "205/55R16",
            NetPrice = 1850.0,
            Category = "Letní"
        };

        // Update DTO obsahuje jen novou cenu, ostatní jsou null
        var updateDto = new UpdateProductDTO { NetPrice = 2000.0 };

        // Act
        ProductMapper.ApplyUpdate(existing, updateDto);

        // Assert — cena se změnila, ostatní zůstala
        existing.NetPrice.Should().Be(2000.0);
        existing.Brand.Should().Be("Michelin");     // nezměněno
        existing.Size.Should().Be("205/55R16");     // nezměněno
        existing.Category.Should().Be("Letní");     // nezměněno
    }

    [Fact]
    public void ApplyUpdate_WhenAllFieldsNull_ChangesNothing()
    {
        // Arrange
        var existing = new Product
        {
            Brand = "Pirelli",
            Size = "245/40R18",
            NetPrice = 3200.0
        };

        var updateDto = new UpdateProductDTO();     // všechno null

        // Act
        ProductMapper.ApplyUpdate(existing, updateDto);

        // Assert — nic se nesmí změnit
        existing.Brand.Should().Be("Pirelli");
        existing.Size.Should().Be("245/40R18");
        existing.NetPrice.Should().Be(3200.0);
    }

    // ===========================================================
    // ToDetailDto — vnořené OrderItems
    // ===========================================================

    [Fact]
    public void ToDetailDto_MapsOrderItemsCorrectly()
    {
        // Arrange
        var product = new Product
        {
            Id = 1,
            Brand = "Michelin",
            OrderItems = new List<OrderItem>
            {
                new() { Id = 1, OrderId = 10, ProductId = 1, Quantity = 4, UnitPrice = 1850 },
                new() { Id = 2, OrderId = 11, ProductId = 1, Quantity = 2, UnitPrice = 1900 }
            }
        };

        // Act
        var dto = ProductMapper.ToDetailDto(product);

        // Assert
        dto.OrderItems.Should().HaveCount(2);
        dto.OrderItems[0].Quantity.Should().Be(4);
        dto.OrderItems[1].UnitPrice.Should().Be(1900);
    }
}
