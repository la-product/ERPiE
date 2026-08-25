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
    public string AccountNumber { get; set; } = string.Empty;
    public string BankCode { get; set; } = string.Empty;
    public string Dic { get; set; } = string.Empty;
    public bool IsSupplier { get; set; }
    public string Note { get; set; } = string.Empty;

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
    public string Dic { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string BankCode { get; set; } = string.Empty;
    public bool IsSupplier { get; set; }
    public string Note { get; set; } = string.Empty;
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
    public string? Dic { get; set; }
    public string? AccountNumber { get; set; } = string.Empty;
    public string? BankCode { get; set; } = string.Empty;
    public bool? IsSupplier { get; set; }
    public string? Note { get; set; }
}

public class AresCompanyDTO
{
    public string Ico { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Zip { get; set; } = string.Empty;
    public string Dic { get; set; } = string.Empty;
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
    public string Dic { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string BankCode { get; set; } = string.Empty;
    public bool IsSupplier { get; set; }
    public string Note { get; set; } = string.Empty;
    public List<OrderDTO> Orders { get; set; } = new();
 
}
