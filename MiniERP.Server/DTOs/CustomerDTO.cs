namespace MiniERP.Server.DTOs;

public class CustomerDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Zip { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Ico { get; set; } = string.Empty;
    public bool IsSupplier { get; set; }
   
}

public class CreateCustomerDTO
{
    public string Name { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Zip { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Ico { get; set; } = string.Empty;
    public bool IsSupplier { get; set; }
}

public class UpdateCustomerDTO
{
    public string? Name { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? Zip { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Ico { get; set; } 
    public bool? IsSupplier { get; set; }
}

public class CustomerDetailDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Zip { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Ico { get; set; } = string.Empty;
    public bool IsSupplier { get; set; }
    public List<OrderDTO> Orders { get; set; } = new();
 
}
