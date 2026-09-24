using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrbeB2B.Crm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarImagemUrlProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "imagem_url",
                table: "produtos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "imagem_url",
                table: "produtos");
        }
    }
}
