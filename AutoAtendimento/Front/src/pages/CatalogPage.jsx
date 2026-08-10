import Navbar from '../components/sections/Navbar';
import PublicCatalog from '../components/sections/PublicCatalog';
import Footer from '../components/sections/Footer';

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <PublicCatalog />
      </main>
      <Footer />
    </div>
  );
}
