using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpresasController : ControllerBase
{
    private readonly IEmpresaReadRepository _readRepository;
    private readonly IEmpresaWriteRepository _writeRepository;

    public EmpresasController(IEmpresaReadRepository readRepository,
                              IEmpresaWriteRepository writeRepository)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> ListarEmpresas()
    {
        var empresas = await _readRepository.ObterTodasAsync();
        return Ok(empresas);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CadastrarEmpresa([FromBody] EmpresaCreateRequest request)
    {
        if (await _writeRepository.CnpjJaCadastradoAsync(request.Cnpj))
            return BadRequest(new { mensagem = "Este CNPJ já está cadastrado no sistema." });

        var novaEmpresa = new Empresa(
            request.CidadeId,
            request.Cnpj,
            request.RazaoSocial,
            request.NomeFantasia,
            request.Cep,
            request.Logradouro,
            request.Numero,
            request.Bairro
        );

        await _writeRepository.CadastrarEmpresaAsync(novaEmpresa);

        return StatusCode(201, new { mensagem = "Empresa cadastrada com sucesso!", id = novaEmpresa.Id });
    }
}
