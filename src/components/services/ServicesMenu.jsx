import React from 'react';
import { CategoryGrid } from './CategoryGrid';

// Univers beauté : section unique affichée sur l'accueil et sur /services.
export const ServicesMenu = () => (
  <section id="services" className="py-20 bg-cream-50/60 relative">
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div id="services-categories" className="scroll-mt-28">
        <CategoryGrid className="mb-0" />
      </div>
    </div>
  </section>
);
