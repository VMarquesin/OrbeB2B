using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProdutosController : ControllerBase
{
    private readonly IProdutoReadRepository _readRepository;
    private readonly IProdutoWriteRepository _writeRepository;

    public ProdutosController(
        IProdutoReadRepository readRepository,
        IProdutoWriteRepository writeRepository)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarProdutosDaEmpresa()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) ||
            !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var produtos = await _readRepository.ObterTodosPorEmpresaAsync(empresaId);

        return Ok(produtos);
    }

    [HttpPost]
    public async Task<IActionResult> CriarProduto(
        [FromBody] ProdutoCreateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) ||
            !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        if (!request.EhFabricacaoPropria && request.FornecedorId is null)
        {
            return BadRequest(new
            {
                mensagem = "Selecione um fornecedor para produtos de terceiros."
            });
        }

        if (request.Imagens is not null && request.Imagens.Count > 4)
        {
            return BadRequest(new
            {
                mensagem = "Um produto pode ter no máximo 4 imagens."
            });
        }

        if (await _writeRepository.CodigoComercialJaCadastradoAsync(
            empresaId,
            request.CodigoComercial))
        {
            return BadRequest(new
            {
                mensagem = "Este código comercial já está cadastrado para a sua empresa."
            });
        }

        var novoProduto = new Produto(
            empresaId,
            request.CategoriaId,
            request.CodigoComercial,
            request.Descricao,
            request.DescricaoDetalhada,
            request.ImagemUrl,
            request.Embalagem,
            request.EhFabricacaoPropria ? null : request.FornecedorId,
            request.EhFabricacaoPropria,
            request.PrecoAtacado,
            request.PrecoLojista,
            request.PrecoVarejo
        );

        if (request.Imagens is not null)
        {
            for (var i = 0; i < request.Imagens.Count; i++)
            {
                novoProduto.Imagens.Add(
                    new ProdutoImagem(
                        novoProduto.Id,
                        request.Imagens[i],
                        i + 1));
            }
        }

        await _writeRepository.CadastrarProdutoAsync(novoProduto);

        return StatusCode(201, new
        {
            mensagem = "Produto cadastrado com sucesso!",
            id = novoProduto.Id
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> AtualizarProduto(
        Guid id,
        [FromBody] ProdutoUpdateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) ||
            !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        if (!request.EhFabricacaoPropria && request.FornecedorId is null)
        {
            return BadRequest(new
            {
                mensagem = "Selecione um fornecedor para produtos de terceiros."
            });
        }

        if (request.Imagens is not null && request.Imagens.Count > 4)
        {
            return BadRequest(new
            {
                mensagem = "Um produto pode ter no máximo 4 imagens."
            });
        }

        var produto = await _writeRepository.ObterPorIdEEmpresaAsync(
            id,
            empresaId);

        if (produto is null)
        {
            return NotFound(new
            {
                mensagem = "Produto não encontrado."
            });
        }

        produto.AtualizarDados(
            request.CodigoComercial,
            request.Descricao,
            request.DescricaoDetalhada,
            request.ImagemUrl,
            request.Embalagem,
            request.CategoriaId,
            request.EhFabricacaoPropria ? null : request.FornecedorId,
            request.EhFabricacaoPropria,
            request.PrecoAtacado,
            request.PrecoLojista,
            request.PrecoVarejo
        );

        if (request.Imagens is not null)
        {
            produto.Imagens.Clear();

            for (var i = 0; i < request.Imagens.Count; i++)
            {
                produto.Imagens.Add(
                    new ProdutoImagem(
                        produto.Id,
                        request.Imagens[i],
                        i + 1));
            }
        }

        await _writeRepository.AtualizarAsync(produto);

        return Ok(new
        {
            mensagem = "Produto atualizado com sucesso."
        });
    }

    [HttpPatch("{id:guid}/inativar")]
    public async Task<IActionResult> InativarProduto(Guid id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) ||
            !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var produto = await _writeRepository.ObterPorIdEEmpresaAsync(
            id,
            empresaId);

        if (produto is null)
        {
            return NotFound(new
            {
                mensagem = "Produto não encontrado."
            });
        }

        produto.Inativar();

        await _writeRepository.AtualizarAsync(produto);

        return Ok(new
        {
            mensagem = "Produto inativado com sucesso."
        });
    }

    [HttpPatch("{id:guid}/reativar")]
    public async Task<IActionResult> ReativarProduto(Guid id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) ||
            !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var produto = await _writeRepository.ObterPorIdEEmpresaAsync(
            id,
            empresaId);

        if (produto is null)
        {
            return NotFound(new
            {
                mensagem = "Produto não encontrado."
            });
        }

        produto.Reativar();

        await _writeRepository.AtualizarAsync(produto);

        return Ok(new
        {
            mensagem = "Produto reativado com sucesso."
        });
    }

    [HttpPost("upload-imagem")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadImagem(IFormFile arquivo)
    {
        if (arquivo is null || arquivo.Length == 0)
        {
            return BadRequest(new
            {
                mensagem = "Selecione uma imagem."
            });
        }

        var extensoesPermitidas = new[]
        {
            ".png",
            ".jpg",
            ".jpeg",
            ".webp"
        };

        var extensao = Path.GetExtension(arquivo.FileName)
            .ToLowerInvariant();

        if (!extensoesPermitidas.Contains(extensao))
        {
            return BadRequest(new
            {
                mensagem = "Formato de imagem não permitido. Use PNG, JPG, JPEG ou WEBP."
            });
        }

        var tiposPermitidos = new[]
        {
            "image/png",
            "image/jpeg",
            "image/webp"
        };

        if (!tiposPermitidos.Contains(
            arquivo.ContentType.ToLowerInvariant()))
        {
            return BadRequest(new
            {
                mensagem = "O arquivo enviado não é uma imagem válida."
            });
        }

        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) ||
            !Guid.TryParse(tenantIdClaim, out var empresaId))
        {
            return Forbid();
        }

        var pastaUploads = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "uploads",
            "produtos",
            empresaId.ToString());

        Directory.CreateDirectory(pastaUploads);

        var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

        var caminhoArquivo = Path.Combine(
            pastaUploads,
            nomeArquivo);

        await using (var stream = new FileStream(
            caminhoArquivo,
            FileMode.Create))
        {
            await arquivo.CopyToAsync(stream);
        }

        var url =
            $"{Request.Scheme}://{Request.Host}/uploads/produtos/{empresaId}/{nomeArquivo}";

        return Ok(new
        {
            imagemUrl = url
        });
    }
}

