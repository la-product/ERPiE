using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddOwnerIdToCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OwnerId",
                table: "Customers",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            // Stávající zákazníci (založení před zavedením ownership) se přiřadí uživateli dkovacik.
            migrationBuilder.Sql(
                "UPDATE Customers SET OwnerId = '6683cdbe-436a-44ef-9165-ac8373e3629d' WHERE OwnerId IS NULL;");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_OwnerId",
                table: "Customers",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_AspNetUsers_OwnerId",
                table: "Customers",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_AspNetUsers_OwnerId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_OwnerId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Customers");
        }
    }
}
