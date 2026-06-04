namespace MiniERP.Server.Models; 
public class Customer {

    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Street { get; set; }= string.Empty;
    public string City { get; set; }= string.Empty;
    public string Zip {  get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public List<Order> Orders { get; set; } = new();
    public List<Invoice> Invoices { get; set; } = new();
}
