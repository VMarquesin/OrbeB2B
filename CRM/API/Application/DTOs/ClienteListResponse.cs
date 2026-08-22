namespace OrbeB2B.Crm.Application.DTOs;

public class ClienteListResponse
{
    public ClienteListResponse() { }

    public Guid Id { get; set; }
    public string Documento { get; set; }
    public string NomeOuRazaoSocial { get; set; }
    public string NomeFantasia { get; set; }
    public string TipoSegmento { get; set; }
    public string NomeCidade { get; set; }
    public string SiglaEstado { get; set; }
    public string StatusCadastro { get; set; }
    public bool EstaAtivo { get; set; }
}
