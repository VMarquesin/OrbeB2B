namespace OrbeB2B.Crm.Application.DTOs;

public class PermissaoPerfilResponse
{
    public Guid Id { get; set; }
    public Guid PerfilId { get; set; }
    public string Area { get; set; } = string.Empty;
}