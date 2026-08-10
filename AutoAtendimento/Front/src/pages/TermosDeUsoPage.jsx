import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Store,
  ArrowLeft,
  ArrowRight,
  Truck,
  Package,
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import logo from '../assets/logo.jpg';

export default function TermosDeUsoPage() {
  const [activeSection, setActiveSection] = useState(1);

  return (
    <div className="min-h-screen bg-stone-100">
        
      <div className="max-w-4xl mx-auto px-6 py-12">

        <Link
          to="/"
          className="text-primary hover:underline"
        >
          ← Voltar
        </Link>

        <h1 className="text-4xl font-bold mt-6 mb-8">
          Termos de Uso e Privacidade do Portal B2B
        </h1>

        <div className="bg-white rounded-xl shadow p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold">
              1. Aceitação dos Termos
            </h2>

            <p className="text-stone-600">
               Ao acessar e utilizar o Portal B2B da A Caseira, o usuário declara
               estar ciente e de acordo com os presentes Termos de Uso. O acesso ao
               sistema destina-se exclusivamente a empresas previamente cadastradas
               e autorizadas pela equipe da A Caseira.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              2. Cadastro da Empresa
            </h2>

            <p className="text-stone-600">
              O cadastro deverá ser realizado com informações verdadeiras e
              atualizadas. A empresa é responsável pela veracidade dos dados
              fornecidos e por mantê-los atualizados sempre que necessário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              3. Acesso ao Potal
            </h2>

            <p className="text-stone-600">
              O login e a senha são de uso exclusivo da empresa cadastrada. O
              compartilhamento dessas credenciais com terceiros é de inteira
              responsabilidade do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              4. Pedidos e Compras
            </h2>

            <p className="text-stone-600 leading-relaxed">
            Todos os pedidos realizados pelo Portal B2B estão sujeitos à análise
            de disponibilidade de estoque, confirmação cadastral e aprovação das
            condições comerciais vigentes.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold mb-2">
            5. Uso Adequado da Plataforma
            </h2>

            <p className="text-stone-600 leading-relaxed">
            É proibida qualquer tentativa de acesso não autorizado, modificação
            das informações do sistema, utilização indevida da plataforma ou
            qualquer ação que possa comprometer sua segurança e funcionamento.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold mb-2">
            6. Alterações dos Termos
            </h2>

            <p className="text-stone-600 leading-relaxed">
            A A Caseira poderá alterar estes Termos de Uso sempre que necessário
            para aprimorar seus serviços ou atender às exigências legais. As
            alterações entrarão em vigor a partir de sua publicação no portal.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold mb-2">
            7. Contato
            </h2>

            <p className="text-stone-600 leading-relaxed">
            Em caso de dúvidas sobre estes Termos de Uso, o usuário poderá entrar
            em contato por meio da página de suporte disponível no Portal B2B.
            </p>
            </section>

            <h1 className="text-4xl font-bold mb-8">
                Política de Privacidade
            </h1>
            <section>
            <h2 className="text-xl font-semibold mb-2">
            8. Objetivo
            </h2>

            <p className="text-stone-600 leading-relaxed">
            Esta Política de Privacidade descreve como a A Caseira coleta,
            utiliza, armazena e protege as informações fornecidas pelos usuários
            durante a utilização do Portal B2B. Nosso compromisso é garantir a
            confidencialidade e a segurança dos dados utilizados para a prestação
            de nossos serviços.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold mb-2">
            9. Informações Coletadas
            </h2>

            <p className="text-stone-600 leading-relaxed">
            Durante o cadastro e utilização do Portal B2B poderão ser coletadas
            informações como razão social, CNPJ, nome do responsável, endereço de
            e-mail, telefone para contato e demais informações necessárias para a
            realização de pedidos e atendimento comercial.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold mb-2">
            10. Finalidade do Uso dos Dados
            </h2>

            <p className="text-stone-600 leading-relaxed">
            Os dados coletados são utilizados exclusivamente para identificação da
            empresa cadastrada, processamento de pedidos, comunicação entre a
            equipe comercial e o cliente, emissão de documentos fiscais e melhoria
            da experiência de utilização da plataforma.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold mb-2">
            11. Compartilhamento de Informações
            </h2>

            <p className="text-stone-600 leading-relaxed">
            A A Caseira não comercializa informações pessoais de seus clientes.
            Os dados poderão ser compartilhados apenas quando necessário para o
            cumprimento de obrigações legais, prestação de serviços relacionados
            ao funcionamento do portal ou mediante autorização do usuário.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold mb-2">
            12. Segurança das Informações
            </h2>

            <p className="text-stone-600 leading-relaxed">
            Adotamos medidas técnicas e administrativas para proteger as
            informações armazenadas contra acessos não autorizados, perda,
            alteração ou divulgação indevida. Apesar dos esforços empregados,
            nenhum sistema é completamente imune a riscos inerentes ao ambiente
            digital.
            </p>
            </section>

            <section>
            <h2 className="text-xl font-semibold mb-2">
            13. Armazenamento dos Dados
            </h2>

            <p className="text-stone-600 leading-relaxed">
            As informações permanecerão armazenadas enquanto forem necessárias
            para a prestação dos serviços oferecidos ou para cumprimento das
            obrigações legais aplicáveis. Após esse período, poderão ser
            excluídas ou anonimizadas.
            </p>
            </section>
          </div>
        </div>
      </div>
  );
}