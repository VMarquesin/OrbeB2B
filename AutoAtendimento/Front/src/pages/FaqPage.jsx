import { useState } from 'react';
import { Search, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. Banco de Dados do FAQ (Facilita a manutenção futura)
const faqData = [
  {
    category: 'Pedidos e Pagamentos',
    questions: [
      {
        q: 'Qual é o valor mínimo para pedidos no atacado?',
        a: 'O pedido mínimo no Portal B2B é de R$ 500,00 para garantir as condições e margens exclusivas de atacado para o seu comércio.',
      },
      {
        q: 'Quais são as formas de pagamento aceitas?',
        a: 'Aceitamos Pix (com 5% de desconto), Cartão de Crédito em até 3x sem juros e Boleto Faturado para 30/60/90 dias (sujeito à análise de crédito).',
      },
      {
        q: 'Como solicito a liberação para comprar no Boleto Faturado?',
        a: 'Ao realizar seu cadastro, nossa equipe faz uma análise automática. Se aprovado, a opção aparecerá no seu checkout em até 24h.',
      },
    ],
  },
  {
    category: 'Logística e Entregas',
    questions: [
      {
        q: 'Qual é o prazo médio de entrega?',
        a: 'O prazo varia de acordo com a sua região. Para o estado de São Paulo, entregamos entre 2 a 5 dias úteis após a confirmação do pagamento.',
      },
      {
        q: 'Como funciona a política de Frete Grátis?',
        a: 'Oferecemos frete grátis para compras acima de R$ 1.500,00 para toda a região Sudeste.',
      },
    ],
  },
  {
    category: 'Produtos e Trocas',
    questions: [
      {
        q: 'Qual é o prazo de validade (shelf life) dos produtos?',
        a: 'Nossas paçocas possuem validade de 8 meses a partir da data de fabricação, garantindo tempo de sobra para o alto giro no seu PDV.',
      },
      {
        q: 'O que faço se meu pedido chegar avariado?',
        a: 'Garantimos a qualidade até a sua prateleira. Entre em contato via WhatsApp em até 7 dias corridos após o recebimento para providenciarmos a reposição.',
      },
    ],
  },
];

export default function FaqPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para controlar qual pergunta está aberta. Guardamos o formato "CategoriaIndex-PerguntaIndex"
  const [openIndex, setOpenIndex] = useState(null);

  // Função para alternar a abertura do Accordion
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filtra as perguntas com base na barra de busca
  const filteredData = faqData.map((section) => ({
    ...section,
    questions: section.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((section) => section.questions.length > 0);

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-primary transition mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Suporte
        </button>

        {/* Header da Página */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-stone-900 mb-3">Dúvidas Frequentes</h1>
          <p className="text-stone-500">Encontre respostas rápidas para as principais dúvidas do nosso portal atacadista.</p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquise por prazos, pagamentos, validade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>

        {/* Lista de FAQs */}
        <div className="space-y-8">
          {filteredData.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              Nenhuma pergunta encontrada para "{searchTerm}".
            </div>
          ) : (
            filteredData.map((section, catIndex) => (
              <div key={catIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-lg font-bold text-primary mb-4">{section.category}</h2>
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                  {section.questions.map((item, qIndex) => {
                    const currentIndex = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === currentIndex;

                    return (
                      <div 
                        key={qIndex}
                        className="border-b border-stone-100 last:border-0"
                      >
                        <button
                          onClick={() => toggleAccordion(currentIndex)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors"
                        >
                          <span className="font-semibold text-stone-800 pr-4">{item.q}</span>
                          <ChevronDown 
                            className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                          />
                        </button>
                        
                        {/* Corpo do Accordion (Resposta) */}
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <p className="p-5 pt-0 text-stone-600 leading-relaxed text-sm">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA de Fuga */}
        <div className="mt-12 text-center bg-primary/5 rounded-xl p-6 border border-primary/10">
          <p className="text-stone-600 mb-2">Não encontrou o que precisava?</p>
          <button 
            onClick={() => window.open('https://wa.me/5500000000000', '_blank')}
            className="text-primary font-bold hover:underline"
          >
            Fale com seu vendedor pelo WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}