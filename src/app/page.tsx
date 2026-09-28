import Header from "@/components/homepage/Header";
import Hero from "@/components/homepage/Hero";
import HowItWorks from "@/components/homepage/HowItWorks";
import FeatureGrid from "@/components/homepage/FeatureGrid";
import SampleOutput from "@/components/homepage/SampleOutput";
import WhyItWorks from "@/components/homepage/WhyItWorks";
import Pricing from "@/components/homepage/Pricing";
import FinalCta from "@/components/homepage/FinalCta";
import Footer from "@/components/homepage/Footer";

export default function HomePage() {
  return (
    <div
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        backgroundColor: "#ffffff",
        color: "#061b31",
      }}
    >
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <FeatureGrid />
        <SampleOutput />
        <WhyItWorks />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
