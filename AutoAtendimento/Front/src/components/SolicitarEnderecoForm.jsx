/**
 * SolicitarEnderecoForm.jsx
 *
 * Formulário de Solicitação de Alteração de Endereço.
 * Demonstra o padrão de consumo dos serviços:
 *   - Captura de sucesso → feedback positivo ao usuário
 *   - Captura de erro    → exibe error.mensagemNormalizada (RFC 7807)
 *   - Estado de loading  → desabilita o botão durante a requisição
 *
 * Zero Trust: clienteId NUNCA está no formulário.
 * O back-end o extrai do JWT via Claim "ClienteId".
 */

import { useState } from 'react';
import { solicitarAlteracaoEndereco } from '../services/cadastroService';

const estadosBr = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

const estadoInicial = {
  cep:         '',
  uf:          'SP',
  cidade:      '',
  bairro:      '',
  logradouro:  '',
  numero:      '',
  complemento: '',
  motivo:      '',
};

export default function SolicitarEnderecoForm() {
  const [form, setForm]         = useState(estadoInicial);
  const [loading, setLoading]   = useState(false);
  const [sucesso, setSucesso]   = useState(null);   // mensagem de sucesso
  const [erro, setErro]         = useState(null);   // mensagem de erro

  // ---- Handlers genéricos ----
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSucesso(null);
    setErro(null);

    try {
      // Zero Trust: apenas dados de endereço + motivo
      // clienteId é extraído do JWT pelo back-end
      const resposta = await solicitarAlteracaoEndereco(form);

      setSucesso(resposta.mensagem);
      setForm(estadoInicial); // Limpa o formulário após sucesso
    } catch (error) {
      // error.mensagemNormalizada é enriquecido pelo interceptor de api.js
      setErro(error.mensagemNormalizada ?? 'Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  }

  // ---- Render ----
  return (
    <div className="solicitar-endereco-form">
      <h2>Solicitar Alteração de Endereço</h2>
      <p className="aviso">
        Por questões fiscais, alterações de endereço precisam ser aprovadas pela equipe comercial.
      </p>

      {/* Feedback de sucesso */}
      {sucesso && (
        <div className="alert alert-sucesso" role="alert">
          {sucesso}
        </div>
      )}

      {/* Feedback de erro */}
      {erro && (
        <div className="alert alert-erro" role="alert">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cep">CEP *</label>
            <input
              id="cep"
              name="cep"
              type="text"
              value={form.cep}
              onChange={handleChange}
              placeholder="00000000"
              maxLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="uf">UF *</label>
            <select id="uf" name="uf" value={form.uf} onChange={handleChange} required>
              {estadosBr.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cidade">Cidade *</label>
          <input
            id="cidade"
            name="cidade"
            type="text"
            value={form.cidade}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bairro">Bairro *</label>
          <input
            id="bairro"
            name="bairro"
            type="text"
            value={form.bairro}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group form-group--grow">
            <label htmlFor="logradouro">Logradouro *</label>
            <input
              id="logradouro"
              name="logradouro"
              type="text"
              value={form.logradouro}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group form-group--small">
            <label htmlFor="numero">Número *</label>
            <input
              id="numero"
              name="numero"
              type="text"
              value={form.numero}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="complemento">Complemento</label>
          <input
            id="complemento"
            name="complemento"
            type="text"
            value={form.complemento}
            onChange={handleChange}
            placeholder="Apto, Bloco, Sala... (opcional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="motivo">Motivo da solicitação *</label>
          <textarea
            id="motivo"
            name="motivo"
            rows={4}
            value={form.motivo}
            onChange={handleChange}
            placeholder="Descreva o motivo da alteração de endereço..."
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </form>
    </div>
  );
}
