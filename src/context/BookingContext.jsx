import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingsApi, adminApi } from '../api/client';
import { scrollToSection } from '../utils/scroll';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedExtraOption, setSelectedExtraOption] = useState(null);

  const getBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('[BookingContext] Failed to fetch bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookings = getBookings;

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = async (bookingData) => {
    try {
      setError(null);
      const data = await bookingsApi.create(bookingData);
      const newBooking = data.booking;
      setBookings((prev) => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setError(null);
      const data = await bookingsApi.updateBookingStatus(bookingId, newStatus);
      const updatedBooking = data.booking;
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
      return updatedBooking;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      setError(null);
      await bookingsApi.deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleServiceForBooking = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const addServiceForBooking = (service, scrollToBooking = true) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) return prev;
      return [...prev, service];
    });
    if (scrollToBooking) {
      // URL propre : /booking-section. Si on y est déjà, le routeur ne
      // rescrolle pas, donc on scrolle manuellement.
      if (pathname === '/booking-section' || pathname === '/reservation') {
        setTimeout(() => {
          scrollToSection('booking-section');
        }, 0);
      } else {
        navigate('/booking-section');
      }
    }
  };

  const removeServiceForBooking = (serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const clearSelectedServices = () => {
    setSelectedServices([]);
  };

  const selectServiceForBooking = (service, extra = null) => {
    addServiceForBooking(service, true);
    if (extra) {
      setSelectedExtraOption(extra);
    }
  };

  const selectedService = selectedServices.length > 0 ? selectedServices[0] : null;
  const setSelectedService = (service) => {
    if (!service) {
      setSelectedServices([]);
    } else {
      setSelectedServices([service]);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        selectedServices,
        setSelectedServices,
        toggleServiceForBooking,
        addServiceForBooking,
        removeServiceForBooking,
        clearSelectedServices,
        selectedService,
        setSelectedService,
        selectedExtraOption,
        setSelectedExtraOption,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        selectServiceForBooking,
        refreshBookings: fetchBookings,
        getBookings
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);