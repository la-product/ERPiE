using FluentAssertions;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;
using MiniERP.Server.Models;

namespace MiniERP.Tests.Mappers;

// Každá testovací třída testuje jednu mapovací třídu.
// [Fact] = jeden konkrétní test bez parametrů
// [Theory] + [InlineData] = jeden test volaný s různými vstupními hodnotami

public class CustomerMapperTests
{
    // ===========================================================
    // ToDto — mapování entity na základní DTO
    // ===========================================================

    [Fact]
    public void ToDto_MapsAllFields()
    {
        // Arrange — připravíš vstupní objekt
        var customer = new Customer
        {
            Id = 1,
            Name = "Firma s.r.o.",
            Street = "Hlavní 1",
            City = "Praha",
            Zip = "11000",
            Email = "info@firma.cz",
            Phone = "123456789",
            Ico = "12345678",
            IsSupplier = false
        };

        // Act — zavoláš testovanou metodu
        var dto = CustomerMapper.ToDto(customer);

        // Assert — ověříš každé pole výstupu
        // FluentAssertions: čitelnější než Assert.Equal()
        dto.Id.Should().Be(1);
        dto.Name.Should().Be("Firma s.r.o.");
        dto.Street.Should().Be("Hlavní 1");
        dto.City.Should().Be("Praha");
        dto.Zip.Should().Be("11000");
        dto.Email.Should().Be("info@firma.cz");
        dto.Phone.Should().Be("123456789");
        dto.Ico.Should().Be("12345678");
        dto.IsSupplier.Should().BeFalse();
    }

    [Fact]
    public void ToDto_WhenIsSupplierTrue_MapsCorrectly()
    {
        // Arrange
        var customer = new Customer { Id = 2, Name = "Dodavatel a.s.", IsSupplier = true };

        // Act
        var dto = CustomerMapper.ToDto(customer);

        // Assert — testujeme jen relevantní pole, ne všechna
        dto.IsSupplier.Should().BeTrue();
    }

    // ===========================================================
    // ToDetailDto — mapování s vnořeným seznamem Orders
    // ===========================================================

    [Fact]
    public void ToDetailDto_WhenNoOrders_ReturnsEmptyOrdersList()
    {
        // Arrange
        var customer = new Customer
        {
            Id = 1,
            Name = "Firma s.r.o.",
            Orders = new List<Order>()   // prázdný seznam
        };

        // Act
        var dto = CustomerMapper.ToDetailDto(customer);

        // Assert
        dto.Orders.Should().BeEmpty();
    }

    [Fact]
    public void ToDetailDto_MapsOrdersCorrectly()
    {
        // Arrange — customer se dvěma objednávkami
        var customer = new Customer
        {
            Id = 1,
            Name = "Firma s.r.o.",
            Orders = new List<Order>
            {
                new() { Id = 10, CustomerId = 1, Status = "new", TotalPrice = 500 },
                new() { Id = 11, CustomerId = 1, Status = "shipped", TotalPrice = 1200 }
            }
        };

        // Act
        var dto = CustomerMapper.ToDetailDto(customer);

        // Assert
        dto.Orders.Should().HaveCount(2);
        dto.Orders[0].Id.Should().Be(10);
        dto.Orders[0].Status.Should().Be("new");
        dto.Orders[1].Id.Should().Be(11);
        dto.Orders[1].TotalPrice.Should().Be(1200);
    }

    // ===========================================================
    // ToEntity — mapování CreateDTO na novou entitu
    // ===========================================================

    [Fact]
    public void ToEntity_MapsAllFields()
    {
        // Arrange
        var createDto = new CreateCustomerDTO
        {
            Name = "Nová firma",
            Street = "Vedlejší 5",
            City = "Brno",
            Zip = "60200",
            Email = "nova@firma.cz",
            Phone = "987654321",
            Ico = "87654321",
            IsSupplier = true
        };

        // Act
        var entity = CustomerMapper.ToEntity(createDto);

        // Assert — Id nemapujeme (přiřadí databáze), všechna ostatní pole ano
        entity.Id.Should().Be(0);   // výchozí hodnota int, DB teprve přiřadí
        entity.Name.Should().Be("Nová firma");
        entity.City.Should().Be("Brno");
        entity.IsSupplier.Should().BeTrue();
    }

    // ===========================================================
    // ApplyUpdate — patch existující entity
    // ===========================================================

    [Fact]
    public void ApplyUpdate_WhenAllFieldsProvided_UpdatesAllFields()
    {
        // Arrange
        var existing = new Customer
        {
            Id = 1,
            Name = "Stará firma",
            City = "Praha",
            Email = "stary@email.cz",
            IsSupplier = false
        };

        var updateDto = new UpdateCustomerDTO
        {
            Name = "Nové jméno",
            City = "Brno",
            Email = "novy@email.cz",
            IsSupplier = true
        };

        // Act
        CustomerMapper.ApplyUpdate(existing, updateDto);

        // Assert
        existing.Name.Should().Be("Nové jméno");
        existing.City.Should().Be("Brno");
        existing.Email.Should().Be("novy@email.cz");
        existing.IsSupplier.Should().BeTrue();
    }

    [Fact]
    public void ApplyUpdate_WhenNameIsNull_DoesNotChangeName()
    {
        // Toto je důležitý test — patch nesmí přepsat pole, která nebyla poslána
        // Arrange
        var existing = new Customer { Id = 1, Name = "Původní název" };
        var updateDto = new UpdateCustomerDTO { Name = null };  // jméno není v requestu

        // Act
        CustomerMapper.ApplyUpdate(existing, updateDto);

        // Assert — jméno musí zůstat původní
        existing.Name.Should().Be("Původní název");
    }

    [Fact]
    public void ApplyUpdate_WhenNameIsEmpty_DoesNotChangeName()
    {
        // Arrange
        var existing = new Customer { Id = 1, Name = "Původní název" };
        var updateDto = new UpdateCustomerDTO { Name = "" };    // prázdný string

        // Act
        CustomerMapper.ApplyUpdate(existing, updateDto);

        // Assert
        existing.Name.Should().Be("Původní název");
    }

    // ===========================================================
    // Theory — jeden test s více datovými sadami
    // ===========================================================

    [Theory]
    [InlineData(1, "Firma A", false)]
    [InlineData(2, "Dodavatel B", true)]
    [InlineData(99, "Zákazník C", false)]
    public void ToDto_Theory_MapsIdNameAndIsSupplier(int id, string name, bool isSupplier)
    {
        // Arrange
        var customer = new Customer { Id = id, Name = name, IsSupplier = isSupplier };

        // Act
        var dto = CustomerMapper.ToDto(customer);

        // Assert — tento test se spustí 3x s různými hodnotami
        dto.Id.Should().Be(id);
        dto.Name.Should().Be(name);
        dto.IsSupplier.Should().Be(isSupplier);
    }
}
