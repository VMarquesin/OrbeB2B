using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrbeB2B.Crm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarArmazenamentoImagensPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE TABLE IF NOT EXISTS public.arquivos_imagens_produtos
                (
                    id uuid NOT NULL,
                    conteudo bytea NOT NULL,
                    tipo_conteudo character varying(100) NOT NULL,
                    nome_arquivo character varying(255) NOT NULL,
                    criado_em timestamp with time zone NOT NULL,
                    CONSTRAINT "PK_arquivos_imagens_produtos" PRIMARY KEY (id)
                );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "arquivos_imagens_produtos");
        }
    }
}