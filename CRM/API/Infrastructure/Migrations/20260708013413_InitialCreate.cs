using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrbeB2B.Crm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "estados",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sigla = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    nome = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_estados", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "perfis_usuario",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_perfil = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    descricao = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perfis_usuario", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cidades",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    estado_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cidades", x => x.id);
                    table.ForeignKey(
                        name: "FK_cidades_estados_estado_id",
                        column: x => x.estado_id,
                        principalTable: "estados",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "empresas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    cidade_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cnpj = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    razao_social = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    nome_fantasia = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    cep = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    logradouro = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    numero = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    bairro = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    esta_ativa = table.Column<bool>(type: "boolean", nullable: false),
                    data_cadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_empresas", x => x.id);
                    table.ForeignKey(
                        name: "FK_empresas_cidades_cidade_id",
                        column: x => x.cidade_id,
                        principalTable: "cidades",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "categorias",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    empresa_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categorias", x => x.id);
                    table.ForeignKey(
                        name: "FK_categorias_empresas_empresa_id",
                        column: x => x.empresa_id,
                        principalTable: "empresas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "clientes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    empresa_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cidade_id = table.Column<Guid>(type: "uuid", nullable: false),
                    documento = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    nome_ou_razao_social = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    nome_fantasia = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    tipo_segmento = table.Column<int>(type: "integer", nullable: false),
                    cep = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    logradouro = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    numero = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    bairro = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status_cadastro = table.Column<int>(type: "integer", nullable: false),
                    data_cadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clientes", x => x.id);
                    table.ForeignKey(
                        name: "FK_clientes_cidades_cidade_id",
                        column: x => x.cidade_id,
                        principalTable: "cidades",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_clientes_empresas_empresa_id",
                        column: x => x.empresa_id,
                        principalTable: "empresas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "fornecedores",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    empresa_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cnpj = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    razao_social = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    esta_ativo = table.Column<bool>(type: "boolean", nullable: false),
                    data_cadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fornecedores", x => x.id);
                    table.ForeignKey(
                        name: "FK_fornecedores_empresas_empresa_id",
                        column: x => x.empresa_id,
                        principalTable: "empresas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pedidos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    empresa_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo_pedido_formatado = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    origem = table.Column<int>(type: "integer", nullable: false),
                    status_logistica = table.Column<int>(type: "integer", nullable: false),
                    status_erp = table.Column<int>(type: "integer", nullable: false),
                    valor_total_pedido = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    observacao_negociacao = table.Column<string>(type: "text", nullable: false),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pedidos", x => x.id);
                    table.ForeignKey(
                        name: "FK_pedidos_clientes_cliente_id",
                        column: x => x.cliente_id,
                        principalTable: "clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_pedidos_empresas_empresa_id",
                        column: x => x.empresa_id,
                        principalTable: "empresas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    perfil_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    senha_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    esta_ativo = table.Column<bool>(type: "boolean", nullable: false),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.id);
                    table.ForeignKey(
                        name: "FK_usuarios_clientes_cliente_id",
                        column: x => x.cliente_id,
                        principalTable: "clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_usuarios_perfis_usuario_perfil_id",
                        column: x => x.perfil_id,
                        principalTable: "perfis_usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "produtos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    empresa_id = table.Column<Guid>(type: "uuid", nullable: false),
                    categoria_id = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo_comercial = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    descricao = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    embalagem = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    fornecedor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    eh_fabricacao_propria = table.Column<bool>(type: "boolean", nullable: false),
                    preco_atacado = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    preco_lojista = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    preco_varejo = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    esta_ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_produtos", x => x.id);
                    table.ForeignKey(
                        name: "FK_produtos_categorias_categoria_id",
                        column: x => x.categoria_id,
                        principalTable: "categorias",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_produtos_empresas_empresa_id",
                        column: x => x.empresa_id,
                        principalTable: "empresas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_produtos_fornecedores_fornecedor_id",
                        column: x => x.fornecedor_id,
                        principalTable: "fornecedores",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "empresa_funcionarios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    empresa_id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cargo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    departamento = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    data_admissao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_empresa_funcionarios", x => x.id);
                    table.ForeignKey(
                        name: "FK_empresa_funcionarios_empresas_empresa_id",
                        column: x => x.empresa_id,
                        principalTable: "empresas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_empresa_funcionarios_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pedido_itens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    pedido_id = table.Column<Guid>(type: "uuid", nullable: false),
                    produto_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantidade_solicitada = table.Column<int>(type: "integer", nullable: false),
                    preco_unitario_aplicado = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    eh_fabricacao_propria_snapshot = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pedido_itens", x => x.id);
                    table.ForeignKey(
                        name: "FK_pedido_itens_pedidos_pedido_id",
                        column: x => x.pedido_id,
                        principalTable: "pedidos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_pedido_itens_produtos_produto_id",
                        column: x => x.produto_id,
                        principalTable: "produtos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_categorias_empresa_id",
                table: "categorias",
                column: "empresa_id");

            migrationBuilder.CreateIndex(
                name: "IX_cidades_estado_id",
                table: "cidades",
                column: "estado_id");

            migrationBuilder.CreateIndex(
                name: "IX_clientes_cidade_id",
                table: "clientes",
                column: "cidade_id");

            migrationBuilder.CreateIndex(
                name: "IX_clientes_empresa_id_documento",
                table: "clientes",
                columns: new[] { "empresa_id", "documento" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_empresa_funcionarios_empresa_id",
                table: "empresa_funcionarios",
                column: "empresa_id");

            migrationBuilder.CreateIndex(
                name: "IX_empresa_funcionarios_usuario_id",
                table: "empresa_funcionarios",
                column: "usuario_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_empresas_cidade_id",
                table: "empresas",
                column: "cidade_id");

            migrationBuilder.CreateIndex(
                name: "IX_empresas_cnpj",
                table: "empresas",
                column: "cnpj",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_estados_sigla",
                table: "estados",
                column: "sigla",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_fornecedores_empresa_id_cnpj",
                table: "fornecedores",
                columns: new[] { "empresa_id", "cnpj" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_pedido_itens_pedido_id",
                table: "pedido_itens",
                column: "pedido_id");

            migrationBuilder.CreateIndex(
                name: "IX_pedido_itens_produto_id",
                table: "pedido_itens",
                column: "produto_id");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_cliente_id",
                table: "pedidos",
                column: "cliente_id");

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_codigo_pedido_formatado",
                table: "pedidos",
                column: "codigo_pedido_formatado",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_empresa_id",
                table: "pedidos",
                column: "empresa_id");

            migrationBuilder.CreateIndex(
                name: "IX_perfis_usuario_nome_perfil",
                table: "perfis_usuario",
                column: "nome_perfil",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_produtos_categoria_id",
                table: "produtos",
                column: "categoria_id");

            migrationBuilder.CreateIndex(
                name: "IX_produtos_empresa_id",
                table: "produtos",
                column: "empresa_id");

            migrationBuilder.CreateIndex(
                name: "IX_produtos_fornecedor_id",
                table: "produtos",
                column: "fornecedor_id");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_cliente_id",
                table: "usuarios",
                column: "cliente_id");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_email",
                table: "usuarios",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_perfil_id",
                table: "usuarios",
                column: "perfil_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "empresa_funcionarios");

            migrationBuilder.DropTable(
                name: "pedido_itens");

            migrationBuilder.DropTable(
                name: "usuarios");

            migrationBuilder.DropTable(
                name: "pedidos");

            migrationBuilder.DropTable(
                name: "produtos");

            migrationBuilder.DropTable(
                name: "perfis_usuario");

            migrationBuilder.DropTable(
                name: "clientes");

            migrationBuilder.DropTable(
                name: "categorias");

            migrationBuilder.DropTable(
                name: "fornecedores");

            migrationBuilder.DropTable(
                name: "empresas");

            migrationBuilder.DropTable(
                name: "cidades");

            migrationBuilder.DropTable(
                name: "estados");
        }
    }
}
