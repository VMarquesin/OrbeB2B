using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrbeB2B.Crm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarImagensProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "produto_imagens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    produto_id = table.Column<Guid>(type: "uuid", nullable: false),
                    imagem_url = table.Column<string>(type: "text", nullable: false),
                    ordem = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_produto_imagens", x => x.id);
                    table.ForeignKey(
                        name: "FK_produto_imagens_produtos_produto_id",
                        column: x => x.produto_id,
                        principalTable: "produtos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_produto_imagens_produto_id_ordem",
                table: "produto_imagens",
                columns: new[] { "produto_id", "ordem" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "produto_imagens");
        }
    }
}
