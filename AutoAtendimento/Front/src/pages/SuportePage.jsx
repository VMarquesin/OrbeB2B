import { MessageCircle, HelpCircle } from 'lucide-react';
// 1. Importação do hook de navegação
import { useNavigate } from 'react-router-dom';

export default function SuportePage() {
  // 2. Instanciando o navegador
  const navigate = useNavigate();

  // 3. PULO DO GATO: A lista de cards agora fica DENTRO do componente
  // para poder enxergar a variável "navigate" que criamos acima.
  const supportCards = [
    {
      id: 'whatsapp',
      icon: MessageCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: 'Falar com meu Vendedor',
      description:
        'Atendimento rápido para dúvidas, negociações e suporte ao seu pedido. Nosso time está pronto para te ajudar.',
      buttonLabel: 'Iniciar Conversa',
      buttonClass:
        'w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition',
      action: () => {
        window.open('https://wa.me/5500000000000', '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'faq',
      icon: HelpCircle,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      title: 'Dúvidas Frequentes',
      description:
        'Consulte prazos de entrega, política de trocas, condições de pagamento e as perguntas mais comuns dos nossos parceiros.',
      buttonLabel: 'Acessar FAQ',
      buttonClass:
        'w-full py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary/5 font-semibold text-sm transition',
      
      // 4. AÇÃO ATUALIZADA AQUI: Ao clicar, ele direciona para a rota /faq
      action: () => navigate('/portal/faq'), 
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Header */}
      <h1 className="text-4xl font-bold text-stone-900 text-center">
        Como podemos ajudar?
      </h1>
      <p className="mt-3 text-sm text-stone-500 text-center max-w-md leading-relaxed">
        Selecione uma das opções abaixo para receber o atendimento adequado e
        resolver suas necessidades rapidamente.
      </p>

      {/* Cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {supportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 flex flex-col items-center text-center gap-4"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.iconBg}`}
              >
                <Icon className={`w-7 h-7 ${card.iconColor}`} strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">{card.title}</h2>
                <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
              
              {/* O botão já estava certinho no seu código original! */}
              <button
                onClick={card.action}
                className={card.buttonClass}
              >
                {card.buttonLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}