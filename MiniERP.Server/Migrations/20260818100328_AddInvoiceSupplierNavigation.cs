using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceSupplierNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Backfill invoices whose SupplierId was left at its 0 default (before the
            // supplier relationship existed) so the new foreign key constraint can be added.
            migrationBuilder.Sql(@"
                UPDATE `Invoices` i
                LEFT JOIN `Customers` c ON c.`Id` = i.`SupplierId`
                SET i.`SupplierId` = i.`CustomerId`
                WHERE c.`Id` IS NULL;
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Customers_SupplierId",
                table: "Invoices",
                column: "SupplierId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Customers_SupplierId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_SupplierId",
                table: "Invoices");
        }
    }
}
