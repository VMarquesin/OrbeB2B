import Navbar from '../components/sections/Navbar';
import HeroSection from '../components/sections/HeroSection';
import ProductCarousel from '../components/sections/ProductCarousel';
import FeaturesSection from '../components/sections/FeaturesSection';
import HistorySection from '../components/sections/HistorySection';
import PartnerShipSection from '../components/sections/PartnerShipSection';
import Footer from '../components/sections/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <ProductCarousel />
        <FeaturesSection />
        <HistorySection />
        <PartnerShipSection />
      </main>
      <Footer />
    </div>
  );
}
