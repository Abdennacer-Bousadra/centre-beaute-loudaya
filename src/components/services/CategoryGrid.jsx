import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useServices } from '../../context/ServicesContext';
import { initialCategories, initialServices } from '../../data/servicesData';
import { CategoryCard } from './CategoryCard';

export const CategoryGrid = ({ className = 'mb-14' }) => {
  const { t, i18n } = useTranslation();
  const { categories, services } = useServices();
  const isArabic = i18n.language === 'ar';

  if (!categories.length && !initialCategories.length) return null;

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const localIds = new Set(initialCategories.map((category) => category.id));

  // Keep the eight editorial categories visible even if the API payload is
  // incomplete; API data still takes precedence for names and descriptions.
  const displayCategories = [
    ...initialCategories.map((localCategory) => {
      const remoteCategory = categoriesById.get(localCategory.id);
      return remoteCategory
        ? { ...localCategory, ...remoteCategory, id: localCategory.id }
        : localCategory;
    }),
    ...categories.filter((category) => !localIds.has(category.id))
  ];

  const getServiceCount = (categoryId) => {
    const remoteCategoryExists = categoriesById.has(categoryId);
    const source = remoteCategoryExists ? services : initialServices;
    return source.filter(
      (service) => service.categoryId === categoryId && service.active !== false
    ).length;
  };

  return (
    <div className={className}>
      <div className="mx-auto mb-8 max-w-3xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-roseGold-300 bg-roseGold-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-plum-900">
          <Sparkles className="h-3.5 w-3.5 text-gold-500" />
          <span>{isArabic ? 'أقسام الجمال' : 'Nos univers beauté'}</span>
        </div>
        <h3 className="font-serif text-2xl font-extrabold text-plum-950 sm:text-3xl">
          {t('services.categoriesTitle')}
        </h3>
        <p className="text-sm font-light leading-relaxed text-charcoal-800/75 sm:text-base">
          {t('services.categoriesSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {displayCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            serviceCount={getServiceCount(category.id)}
          />
        ))}
      </div>
    </div>
  );
};
