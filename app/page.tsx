import { Hero } from '@/components/hero/Hero';
import { ChapterRail } from '@/components/nav/ChapterRail';
import { MachineStoryExplorer } from '@/components/chapters/MachineStoryExplorer';
import { ConnectivityExplorer } from '@/components/chapters/ConnectivityExplorer';
import { DecisionLab } from '@/components/chapters/DecisionLab';
import { CapabilityExplorer } from '@/components/chapters/CapabilityExplorer';
import { PhysicalAIExplorer } from '@/components/chapters/PhysicalAIExplorer';
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
      <MachineStoryExplorer />
      <ConnectivityExplorer />
      <DecisionLab />
      <CapabilityExplorer />
      <PhysicalAIExplorer />
      <EngineeringWork />
      <ContactForm />
    </>
  );
}
