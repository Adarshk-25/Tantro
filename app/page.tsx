import { Hero } from '@/components/hero/Hero';
import { ChapterRail } from '@/components/nav/ChapterRail';
import { PhysicalWorld } from '@/components/chapters/PhysicalWorld';
import { IndustrialNetworkVisualization } from '@/components/chapters/IndustrialNetworkVisualization';
import { IntelligenceSimulator } from '@/components/chapters/IntelligenceSimulator';
import { CapabilityExplorer } from '@/components/chapters/CapabilityExplorer';
import { RoboticsExplorer } from '@/components/chapters/RoboticsExplorer';
import { EngineeringWork } from '@/components/chapters/EngineeringWork';
import { ContactForm } from '@/components/chapters/ContactForm';
import { site } from '@/content/site';
import { capabilities } from '@/content/capabilities';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tantro',
  url: site.url,
  email: site.email,
  description: site.description,
  knowsAbout: capabilities.map((c) => c.full),
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ChapterRail />
      <Hero />
      <PhysicalWorld />
      <IndustrialNetworkVisualization />
      <IntelligenceSimulator />
      <CapabilityExplorer />
      <RoboticsExplorer />
      <EngineeringWork />
      <ContactForm />
    </>
  );
}
