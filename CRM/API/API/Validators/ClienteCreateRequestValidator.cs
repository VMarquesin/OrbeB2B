using FluentValidation;
using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.API.Validators;

public class ClienteCreateRequestValidator : AbstractValidator<ClienteCreateRequest>
{
    public ClienteCreateRequestValidator()
    {
        RuleFor(x => x.CidadeId)
            .NotEmpty().WithMessage("A cidade é obrigatória.");

        RuleFor(x => x.Documento)
            .NotEmpty().WithMessage("O documento (CPF/CNPJ) é obrigatório.")
            .Matches(@"^\d{11}$|^\d{14}$")
            .WithMessage("O documento deve conter exatamente 11 dígitos (CPF) ou 14 dígitos (CNPJ), sem pontuação.");

        RuleFor(x => x.NomeOuRazaoSocial)
            .NotEmpty().WithMessage("O Nome / Razão Social é obrigatório.")
            .MinimumLength(3).WithMessage("O Nome / Razão Social deve ter no mínimo 3 caracteres.")
            .MaximumLength(200).WithMessage("O Nome / Razão Social deve ter no máximo 200 caracteres.");

        RuleFor(x => x.NomeFantasia)
            .NotEmpty().WithMessage("O Nome Fantasia é obrigatório.")
            .MaximumLength(200).WithMessage("O Nome Fantasia deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Cep)
            .NotEmpty().WithMessage("O CEP é obrigatório.")
            .Matches(@"^\d{8}$").WithMessage("O CEP deve ter exatamente 8 dígitos numéricos, sem hífen.");

        RuleFor(x => x.Logradouro)
            .NotEmpty().WithMessage("O logradouro é obrigatório.")
            .MaximumLength(150).WithMessage("O logradouro deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Numero)
            .NotEmpty().WithMessage("O número é obrigatório.")
            .MaximumLength(20).WithMessage("O número deve ter no máximo 20 caracteres.");

        RuleFor(x => x.Bairro)
            .NotEmpty().WithMessage("O bairro é obrigatório.")
            .MaximumLength(100).WithMessage("O bairro deve ter no máximo 100 caracteres.");
    }
}
