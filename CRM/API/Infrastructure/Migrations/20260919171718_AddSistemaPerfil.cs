using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrbeB2B.Crm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSistemaPerfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "sistema",
                table: "perfis_usuario",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "sistema",
                table: "perfis_usuario");
        }
    }
}
