/**
 * cadastroService.js — Serviços de Cadastro e Autoatendimento do Comprador B2B
 *
 * Rotas consumidas:
 *   GET  /api/meu-cadastro/perfil
 *   POST /api/meu-cadastro/solicitar-alteracao-endereco
 *   POST /api/registro
 *   GET  /api/registro/confirmar?token=...
 *
 * Regra de ouro: NUNCA enviar clienteId no payload.
 * O back-end extrai o ClienteId diretamente das Claims do JWT.
 */

import api from './api';

// ============================================================
// Perfil do Cliente B2B (Logado)
// ============================================================

/**
 * Busca o cadastro completo do cliente autenticado (dados cadastrais + endereço).
 * O ClienteId NÃO é enviado — o back-end o extrai do JWT.
 *
 * @returns {Promise<{
 *   nome: string,
 *   razaoSocial: string,
 *   nomeFantasia: string,
 *   cnpj: string,
 *   email: string,
 *   telefone: string,
 *   cep: string,
 *   logradouro: string,
 *   numero: string,
 *   bairro: string,
 *   cidade: string,
 *   uf: string
 * }>}
 */
export async function obterMeuPerfil() {
  const { data } = await api.get('/api/meu-cadastro/perfil');
  return data;
}

// ============================================================
// Alteração de Endereço (Workflow de Aprovação)
// ============================================================

/**
 * Abre uma solicitação de alteração de endereço.
 * O ClienteId NÃO é enviado — o back-end o extrai do JWT.
 *
 * Payload mapeado para SolicitacaoEnderecoCreateRequest:
 *   { cep, uf, cidade, bairro, logradouro, numero, complemento, motivo }
 *
 * @param {{ cep: string, uf: string, cidade: string, bairro: string,
 *            logradouro: string, numero: string, complemento?: string,
 *            motivo: string }} dados
 * @returns {Promise<{ mensagem: string, id: string }>}
 */
export async function solicitarAlteracaoEndereco(dados) {
  const payload = {
    cep:         dados.cep,
    uf:          dados.uf,
    cidade:      dados.cidade,
    bairro:      dados.bairro,
    logradouro:  dados.logradouro,
    numero:      dados.numero,
    complemento: dados.complemento ?? null,
    motivo:      dados.motivo,
    // clienteId: NUNCA enviado — vem do JWT no back-end
  };

  const { data } = await api.post('/api/meu-cadastro/solicitar-alteracao-endereco', payload);
  return data;
}

// ============================================================
// Auto-Cadastro (Registro Público — sem autenticação)
// ============================================================

/**
 * Realiza o auto-cadastro de um novo comprador B2B.
 * Rota pública (AllowAnonymous) — não precisa de token.
 *
 * Payload mapeado para RegistroClienteRequest:
 *   { cnpj, razaoSocial, nomeFantasia, cep, logradouro, numero, bairro,
 *     emailAcesso, senhaAcesso }
 *   (sem cidadeId — o back-end usa CEP para buscar)
 *
 * @param {{ cnpj, razaoSocial, nomeFantasia, cep, logradouro, numero,
 *            bairro, emailAcesso, senhaAcesso }} dados
 * @returns {Promise<{ mensagem: string, clienteId: string }>}
 */
export async function registrar(dados) {
  const { data } = await api.post('/api/registro', dados);
  return data;
}

/**
 * Confirma o e-mail via link de Double Opt-in.
 * Rota pública (AllowAnonymous) — chamada pelo front quando o usuário
 * clica no link recebido por e-mail (/confirmar?token=...).
 *
 * @param {string} token - Token JWT de verificação extraído da query string
 * @returns {Promise<{ mensagem: string }>}
 */
export async function confirmarEmail(token) {
  const { data } = await api.get('/api/registro/confirmar', { params: { token } });
  return data;
}
