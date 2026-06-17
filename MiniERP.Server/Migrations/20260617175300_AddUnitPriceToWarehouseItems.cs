using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddUnitPriceToWarehouseItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "UnitPrice",
                table: "WarehouseItems",
                type: "double",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.Sql(@"
                UPDATE WarehouseItems w
                JOIN Products p ON p.Id = w.ProductId
                SET w.UnitPrice = p.NetPrice");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnitPrice",
                table: "WarehouseItems");
        }
    }
}
