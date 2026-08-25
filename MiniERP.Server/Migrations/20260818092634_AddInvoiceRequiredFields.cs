using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceRequiredFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BankAccount",
                table: "Invoices",
                type: "longtext",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "InvoiceNumber",
                table: "Invoices",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Invoices",
                type: "longtext",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "Invoices",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateOnly>(
                name: "TaxableSupplyDate",
                table: "Invoices",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<string>(
                name: "VariableSymbol",
                table: "Invoices",
                type: "longtext",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Dic",
                table: "Customers",
                type: "longtext",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql("UPDATE `Invoices` SET `InvoiceNumber` = CONCAT('FV-', `Id`) WHERE `InvoiceNumber` = '';");
            migrationBuilder.Sql("UPDATE `Invoices` SET `TaxableSupplyDate` = `IssueDate` WHERE `TaxableSupplyDate` = '0001-01-01';");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceNumber",
                table: "Invoices",
                column: "InvoiceNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Invoices_InvoiceNumber",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "BankAccount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "InvoiceNumber",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "TaxableSupplyDate",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "VariableSymbol",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Dic",
                table: "Customers");
        }
    }
}
