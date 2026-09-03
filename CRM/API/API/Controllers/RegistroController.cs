using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Services.Interfaces;
using OrbeB2B.Crm.Domain.Entities;
using OrbeB2B.Crm.Infrastructure.Data;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/registro")]
[AllowAnonymous]
public class RegistroController : ControllerBase
{
    private readonly CrmDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public RegistroController(
        CrmDbContext context,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    [HttpPost]
    public async Task<IActionResult> Registrar(
        [FromBody] RegistroEmpresaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NomeResponsavel) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest(new
            {
                mensagem = "Preencha todos os campos obrigatórios."
            });
        }

        var cnpj = request.Cnpj.Trim();
        var email = request.Email.Trim();

        if (await _context.Empresas.AnyAsync(e => e.Cnpj == cnpj))
        {
            return BadRequest(new
            {
                mensagem = "Este CNPJ já está cadastrado."
            });
        }

        if (await _context.Usuarios.AnyAsync(u => u.Email == email))
        {
            return BadRequest(new
            {
                mensagem = "Este e-mail já está cadastrado."
            });
        }

        var cidadeExiste = await _context.Cidades
            .AnyAsync(c => c.Id == request.CidadeId);

        if (!cidadeExiste)
        {
            return BadRequest(new
            {
                mensagem = "A cidade informada não existe."
            });
        }

        var perfilAdmin = await _context.PerfisUsuario
            .FirstOrDefaultAsync(p => p.NomePerfil == "AdminMaster");

        if (perfilAdmin is null)
        {
            return StatusCode(500, new
            {
                mensagem = "O perfil AdminMaster não está configurado no sistema."
            });
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var empresa = new Empresa(
                request.CidadeId,
                cnpj,
                request.RazaoSocial,
                request.NomeFantasia,
                request.Cep,
                request.Logradouro,
                request.Numero,
                request.Bairro
            );

            var senhaHash = _passwordHasher.Hash(request.Senha);

            var usuario = new Usuario(
                perfilAdmin.Id,
                request.NomeResponsavel,
                email,
                senhaHash
            );

            var vinculo = new EmpresaFuncionario(
                empresa.Id,
                usuario.Id,
                "Administrador",
                "Administracao"
            );

            await _context.Empresas.AddAsync(empresa);
            await _context.Usuarios.AddAsync(usuario);
            await _context.EmpresaFuncionarios.AddAsync(vinculo);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return StatusCode(201, new
            {
                mensagem = "Cadastro realizado com sucesso!",
                empresaId = empresa.Id,
                usuarioId = usuario.Id
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}