namespace OrbeB2B.Crm.Domain.Enums;

/// <summary>
/// Forma de pagamento registrada no pedido B2B.
/// Valores inteiros persistidos no banco — não renomear membros existentes.
/// </summary>
public enum FormaPagamento
{
    NaoInformada = 0,
    Pix          = 1,
    BoletoPrazo  = 2,
    CartaoCredito = 3,
}
