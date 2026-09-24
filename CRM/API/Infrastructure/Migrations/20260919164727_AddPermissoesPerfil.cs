using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrbeB2B.Crm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPermissoesPerfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "permissoes_perfil",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    perfil_id = table.Column<Guid>(type: "uuid", nullable: false),
                    area = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permissoes_perfil", x => x.id);
                    table.ForeignKey(
                        name: "FK_permissoes_perfil_perfis_usuario_perfil_id",
                        column: x => x.perfil_id,
                        principalTable: "perfis_usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_permissoes_perfil_perfil_id_area",
                table: "permissoes_perfil",
                columns: new[] { "perfil_id", "area" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "permissoes_perfil");
        }
    }
}
