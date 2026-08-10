import Navbar from '../components/sections/Navbar';
import ProductDetails from '../components/sections/ProductDetails';
import Footer from '../components/sections/Footer';

export default function ProductDetailPage({ b2b = false }) {
  return (
    <div className="min-h-screen bg-white">

      {!b2b && <Navbar />}

      <main>
        <ProductDetails b2b={b2b} />
      </main>

      {!b2b && <Footer />}

    </div>
  );
}