CREATE TYPE "tipo_segmento_cliente" AS ENUM (
  'B2B',
  'B2C'
);

CREATE TYPE "origem_pedido" AS ENUM (
  'APP',
  'MANUAL'
);

CREATE TYPE "status_fila_logistica" AS ENUM (
  'AguardandoValidacao',
  'Faturado',
  'EmSeparacao',
  'Enviado',
  'Entregue',
  'Cancelado'
);

CREATE TYPE "status_integracao_erp" AS ENUM (
  'Pendente',
  'Aprovado',
  'Rejeitado'
);

CREATE TYPE "status_cadastro_cliente" AS ENUM (
  'Pendente',
  'Aprovado',
  'Rejeitado'
);

CREATE TABLE "estado" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "sigla" varchar(2) UNIQUE NOT NULL,
  "nome" varchar(50) NOT NULL
);

CREATE TABLE "cidade" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "estado_id" uuid NOT NULL,
  "nome" varchar(100) NOT NULL
);

CREATE TABLE "empresa" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "cidade_id" uuid NOT NULL,
  "cnpj" varchar(14) UNIQUE NOT NULL,
  "razao_social" varchar(200) NOT NULL,
  "nome_fantasia" varchar(200),
  "cep" varchar(8) NOT NULL,
  "logradouro" varchar(150) NOT NULL,
  "numero" varchar(20) NOT NULL,
  "bairro" varchar(100) NOT NULL,
  "esta_ativa" boolean NOT NULL DEFAULT true,
  "data_cadastro" timestamp DEFAULT (now())
);

CREATE TABLE "perfil_usuario" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "nome_perfil" varchar(50) UNIQUE NOT NULL,
  "descricao" text
);

CREATE TABLE "usuario" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "perfil_id" uuid NOT NULL,
  "nome" varchar(150) NOT NULL,
  "email" varchar(150) UNIQUE NOT NULL,
  "senha_hash" varchar(255) NOT NULL,
  "esta_ativo" boolean NOT NULL DEFAULT true,
  "data_criacao" timestamp DEFAULT (now()),
  "cliente_id" uuid
);

CREATE TABLE "empresa_funcionario" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "empresa_id" uuid NOT NULL,
  "usuario_id" uuid UNIQUE NOT NULL,
  "cargo" varchar(100) NOT NULL,
  "departamento" varchar(100),
  "data_admissao" timestamp DEFAULT (now())
);

CREATE TABLE "cliente" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "empresa_id" uuid NOT NULL,
  "cidade_id" uuid NOT NULL,
  "documento" varchar(14) NOT NULL,
  "nome_ou_razao_social" varchar(200) NOT NULL,
  "nome_fantasia" varchar(200),
  "tipo_segmento" tipo_segmento_cliente NOT NULL DEFAULT 'B2B',
  "cep" varchar(8) NOT NULL,
  "logradouro" varchar(150) NOT NULL,
  "numero" varchar(20) NOT NULL,
  "bairro" varchar(100) NOT NULL,
  "status_cadastro" status_cadastro_cliente NOT NULL DEFAULT 'Pendente',
  "data_cadastro" timestamp DEFAULT (now())
);

CREATE TABLE "categoria" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "empresa_id" uuid NOT NULL,
  "nome" varchar(100) NOT NULL
);

CREATE TABLE "produto" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "empresa_id" uuid NOT NULL,
  "categoria_id" uuid NOT NULL,
  "codigo_comercial" varchar(50) NOT NULL,
  "descricao" varchar(255) NOT NULL,
  "embalagem" varchar(50) NOT NULL,
  "fornecedor_origem" varchar(150) NOT NULL,
  "eh_fabricacao_propria" boolean NOT NULL,
  "preco_atacado" numeric(12,2) NOT NULL,
  "preco_lojista" numeric(12,2) NOT NULL,
  "preco_varejo" numeric(12,2) NOT NULL DEFAULT 0,
  "esta_ativo" boolean NOT NULL DEFAULT true
);

CREATE TABLE "pedido" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "empresa_id" uuid NOT NULL,
  "cliente_id" uuid NOT NULL,
  "codigo_pedido_formatado" varchar(50) UNIQUE NOT NULL,
  "origem" origem_pedido NOT NULL DEFAULT 'APP',
  "status_logistica" status_fila_logistica NOT NULL DEFAULT 'AguardandoValidacao',
  "status_erp" status_integracao_erp NOT NULL DEFAULT 'Pendente',
  "valor_total_pedido" numeric(12,2) NOT NULL,
  "observacao_negociacao" text,
  "data_criacao" timestamp DEFAULT (now())
);

CREATE TABLE "pedido_iten" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "pedido_id" uuid NOT NULL,
  "produto_id" uuid NOT NULL,
  "quantidade_solicitada" int NOT NULL,
  "preco_unitario_aplicado" numeric(12,2) NOT NULL,
  "eh_fabricacao_propria_snapshot" boolean NOT NULL
);

CREATE UNIQUE INDEX ON "clientes" ("empresa_id", "documento");

COMMENT ON COLUMN "estados"."sigla" IS 'Ex: SP, RJ, MG';

COMMENT ON COLUMN "estados"."nome" IS 'Ex: São Paulo';

COMMENT ON COLUMN "cidades"."nome" IS 'Ex: Tupã, Pompéia';

COMMENT ON COLUMN "empresas"."cidade_id" IS 'Vinculo com a localização exata fixada';

COMMENT ON COLUMN "clientes"."cidade_id" IS 'Garante integridade total para os relatórios de BI do CRM';

ALTER TABLE "cidades" ADD FOREIGN KEY ("estado_id") REFERENCES "estados" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "empresas" ADD FOREIGN KEY ("cidade_id") REFERENCES "cidades" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "clientes" ADD FOREIGN KEY ("cidade_id") REFERENCES "cidades" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuarios" ADD FOREIGN KEY ("perfil_id") REFERENCES "perfis_usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuarios" ADD FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "empresa_funcionarios" ADD FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "empresa_funcionarios" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "clientes" ADD FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "categorias" ADD FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "produtos" ADD FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "produtos" ADD FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pedidos" ADD FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pedidos" ADD FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pedido_itens" ADD FOREIGN KEY ("pedido_id") REFERENCES "pedidos" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "pedido_itens" ADD FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
