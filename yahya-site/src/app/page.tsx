import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MobileBar } from '@/components/MobileBar';
import { About } from '@/components/sections/About';
import { Booking } from '@/components/sections/Booking';
import { Gallery } from '@/components/sections/Gallery';
import { Hero } from '@/components/sections/Hero';
import { Location } from '@/components/sections/Location';
import { Models } from '@/components/sections/Models';
import { Reviews } from '@/components/sections/Reviews';
import { Services } from '@/components/sections/Services';
import { JsonLd, siteSchema } from '@/lib/schema';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Models />
        <Gallery />
        <Reviews />
        <Location />
        <Booking />
      </main>
      <Footer />
      <MobileBar />
      <JsonLd data={siteSchema()} />
    </>
  );
}
