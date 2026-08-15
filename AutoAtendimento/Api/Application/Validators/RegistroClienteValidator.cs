using FluentValidation;

namespace OrbeB2B.AutoAtendimento.Application.Validators;

public class RegistroClienteValidator : AbstractValidator<DTOs.RegistroClienteRequest>
{
    public RegistroClienteValidator()
    {
        RuleFor(x => x.CidadeId)
            .NotEmpty().WithMessage("A cidade é obrigatória.");

        RuleFor(x => x.Cnpj)
            .NotEmpty().WithMessage("O CNPJ é obrigatório.")
            .Matches(@"^\d{14}$").WithMessage("O CNPJ deve ter exatamente 14 dígitos numéricos, sem pontuação.");

        RuleFor(x => x.RazaoSocial)
            .NotEmpty().WithMessage("A Razão Social é obrigatória.")
            .MaximumLength(200).WithMessage("A Razão Social deve ter no máximo 200 caracteres.");

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

        RuleFor(x => x.EmailAcesso)
            .NotEmpty().WithMessage("O e-mail é obrigatório.")
            .EmailAddress().WithMessage("O e-mail informado não é válido.")
            .MaximumLength(150).WithMessage("O e-mail deve ter no máximo 150 caracteres.");

        RuleFor(x => x.SenhaAcesso)
            .NotEmpty().WithMessage("A senha é obrigatória.")
            .MinimumLength(6).WithMessage("A senha deve ter no mínimo 6 caracteres.");
    }
}
