const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    console.error('[API] Network error:', networkError);
    throw new Error('Erreur de connexion au serveur.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error?.message || `Erreur HTTP ${response.status}`;
    const code = data?.error?.code || 'API_ERROR';
    const details = data?.error?.details;
    const error = new Error(message);
    error.code = code;
    error.status = response.status;
    error.details = details;
    console.error(`[API] ${options.method || 'GET'} ${endpoint} failed:`, error);
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};

export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  getAvailability: (date) => api.get(`/bookings/availability?date=${date}`),
  getBookings: () => api.get('/admin/bookings') // or just for admin; but we'll handle usage
};

export const servicesApi = {
  getAll: () => api.get('/services'),
  getByCategory: (slug) => api.get(`/services/${slug}`)
};

export const adminApi = {
  login: (email, password) => api.post('/admin/login', { email, password }),
  logout: () => api.post('/admin/logout'),
  verify: () => api.get('/admin/me'),
  getBookings: (status) => {
    const query = status ? `?status=${status}` : '';
    return api.get(`/admin/bookings${query}`);
  },
  updateBookingStatus: (id, status) => api.patch(`/admin/bookings/${id}/status`, { status }),
  deleteBooking: (id) => api.delete(`/admin/bookings/${id}`),
  getServices: () => api.get('/admin/services'),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  updateServicePrice: (id, price) => api.patch(`/admin/services/${id}/price`, { price }),
  updateServiceAvailability: (id, available) => api.patch(`/admin/services/${id}/availability`, { available }),
  deleteService: (id) => api.delete(`/admin/services/${id}`)
};