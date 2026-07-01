using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class ProductMapper
{
    public static ProductDTO ToDto(Product p) => new()
    {
        Id = p.Id,
        Size = p.Size,
        Brand = p.Brand,
        Pattern = p.Pattern,
        Si = p.Si,
        Li = p.Li,
        NetPrice = p.NetPrice,
        Category = p.Category
    };

    public static ProductDetailDTO ToDetailDto(Product p) => new()
    {
        Id = p.Id,
        Size = p.Size,
        Brand = p.Brand,
        Pattern = p.Pattern,
        Si = p.Si,
        Li = p.Li,
        NetPrice = p.NetPrice,
        Category = p.Category,
        OrderItems = p.OrderItems.Select(OrderItemMapper.ToDto).ToList()
    };

    public static Product ToEntity(CreateProductDTO dto) => new()
    {
        Size = dto.Size,
        Brand = dto.Brand,
        Pattern = dto.Pattern,
        Si = dto.Si,
        Li = dto.Li,
        NetPrice = dto.NetPrice,
        Category = dto.Category
    };

    public static void ApplyUpdate(Product product, UpdateProductDTO dto)
    {
        if (dto.Size != null) product.Size = dto.Size;
        if (dto.Brand != null) product.Brand = dto.Brand;
        if (dto.Pattern != null) product.Pattern = dto.Pattern;
        if (dto.Si.HasValue) product.Si = dto.Si.Value;
        if (dto.Li != null) product.Li = dto.Li;
        if (dto.NetPrice.HasValue) product.NetPrice = dto.NetPrice.Value;
        if (dto.Category != null) product.Category = dto.Category;
    }
}
