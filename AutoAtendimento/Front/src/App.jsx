import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/ui/ScrollToTop';
import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CadastroB2BPage from './pages/CadastroB2BPage';
import LoginB2BPage from './pages/LoginB2BPage';
import PortalLayout from './components/portal/PortalLayout';
import SejaParceiroPage from './pages/SejaParceiroPage';
import DashboardLojistaPage from './pages/DashboardLojistaPage';
import CatalogoLogadoPage from './pages/CatalogoLogadoPage';
import MeusPedidosPage from './pages/MeusPedidosPage';
import DetalhesPedidoPage from './pages/DetalhesPedidoPage';
import SuportePage from './pages/SuportePage';
import FaqPage from './pages/FaqPage';
import CheckoutB2BPage from './pages/CheckoutB2BPage';
import PedidoConfirmadoPage from './pages/PedidoConfirmadoPage';
import TermosDeUsoPage from './pages/TermosDeUsoPage';
import Carrinho from './pages/CarrinhoPage';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/catalogo/:productId" element={<ProductDetailPage b2b={false} />} />
          <Route path="/login" element={<LoginB2BPage />} />
          <Route path="/cadastro" element={<CadastroB2BPage />} />
          <Route path="/seja-parceiro" element={<SejaParceiroPage />} />

          {/* Portal B2B (área logada) */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<DashboardLojistaPage />} />
            <Route path="catalogo" element={<CatalogoLogadoPage />} />
            <Route path="produto/:productId" element={<ProductDetailPage b2b={true} />} />
            <Route path="pedidos" element={<MeusPedidosPage />} />
            <Route path="pedidos/:id" element={<DetalhesPedidoPage />} />
            <Route path="suporte" element={<SuportePage />} />
            <Route path="termos" element={<TermosDeUsoPage />} />
            <Route path="Carrinho" element={<Carrinho/>} />
          </Route>

          {/* Standalone portal pages (own header) */}
          <Route path="/portal/checkout" element={<CheckoutB2BPage />} />
          <Route path="/portal/confirmado" element={<PedidoConfirmadoPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
