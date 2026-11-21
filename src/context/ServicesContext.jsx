import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { servicesApi, adminApi } from '../api/client';
import { initialCategories, initialServices } from '../data/servicesData';

const ServicesContext = createContext();

function normalizeService(service, categorySlug) {
  return {
    ...service,
    id: service.id,  // Keep numeric ID for booking
    slug: service.slug,  // Keep slug for reference
    dbId: service.id,
    categoryId: categorySlug
  };
}

function toFrontendFormat(categories) {
  return categories.map((cat) => ({
    ...cat,
    id: cat.slug,
    services: (cat.services || []).map((s) => normalizeService(s, cat.slug))
  }));
}

function getFallbackData() {
  const normalizedCategories = initialCategories.map((cat) => ({
    ...cat,
    id: cat.id,
    slug: cat.slug,
    services: (cat.services || []).map((s) => ({ ...s, id: s.id, slug: s.id, categoryId: cat.id }))
  }));
  const normalizedServices = initialServices.map((s) => ({ ...s, id: s.id, slug: s.id }));
  return {
    categories: normalizedCategories,
    services: normalizedServices
  };
}

function deduplicateServices(services) {
  const seen = new Set();
  return services.filter((service) => {
    const key = service.slug || service.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const ServicesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [salonSettings, setSalonSettings] = useState({
    phone: '',
    whatsappNumber: '',
    instagramUsername: '',
    sundayOpen: false,
    openHour: '10:00',
    closeHour: '20:00'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (isAdminMode) {
        data = await adminApi.getServices();
      } else {
        data = await servicesApi.getAll();
      }
      const allCategories = data.categories || [];
      if (allCategories.length === 0) {
        throw new Error('Empty categories from API');
      }
      const normalizedCategories = toFrontendFormat(allCategories);
      setCategories(normalizedCategories);
      const allServices = normalizedCategories.flatMap((cat) => cat.services || []);
      const deduplicatedServices = deduplicateServices(allServices);
      setServices(deduplicatedServices);
    } catch (err) {
      console.error('[ServicesContext] API failed:', err.message);
      setError(err.message || 'Failed to load services');
      setCategories([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [isAdminMode]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = async (newService) => {
    try {
      setError(null);
      const data = await adminApi.createService(newService);
      const serviceWithId = data.service;
      setServices((prev) => [serviceWithId, ...prev]);
      fetchServices();
      return serviceWithId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateService = async (updatedService) => {
    try {
      setError(null);
      const data = await adminApi.updateService(updatedService.dbId, updatedService);
      setServices((prev) =>
        prev.map((s) => (s.id === updatedService.id ? { ...s, ...updatedService } : s))
      );
      fetchServices();
      return data.service;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteService = async (serviceId) => {
    try {
      setError(null);
      const service = services.find((s) => s.id === serviceId);
      if (!service) throw new Error('Service not found');
      await adminApi.deleteService(service.dbId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      fetchServices();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleServiceAvailability = async (serviceId) => {
    try {
      setError(null);
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;
      await adminApi.updateServiceAvailability(service.dbId, !service.available);
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, available: !s.available } : s
        )
      );
      fetchServices();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSalonSettings = async (newSettings) => {
    try {
      setError(null);
      setSalonSettings((prev) => ({ ...prev, ...newSettings }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetToDefaultServices = async () => {
    try {
      setError(null);
      fetchServices();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <ServicesContext.Provider
      value={{
        categories,
        services,
        salonSettings,
        loading,
        error,
        isAdminMode,
        setIsAdminMode,
        addService,
        updateService,
        deleteService,
        toggleServiceAvailability,
        updateSalonSettings,
        resetToDefaultServices,
        refreshServices: fetchServices
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => useContext(ServicesContext);