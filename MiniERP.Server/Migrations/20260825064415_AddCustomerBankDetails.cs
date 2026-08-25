using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerBankDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccountNumber",
                table: "Customers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "BankCode",
                table: "Customers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountNumber",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "BankCode",
                table: "Customers");
        }
    }
}
