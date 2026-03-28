import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../config';


const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await Storage.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await Storage.get('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        await Storage.set('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        await Storage.clearAll();

      }
    }
    return Promise.reject(error);
  },
);


export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post('/auth/register', body),
  login: (body: { email: string; password: string }) =>
    api.post('/auth/login', body),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

export const pitchApi = {
  getAll: () => api.get('/pitches'),
};

export const slotApi = {
  getSlots: (pitchId: string, date: string) =>
    api.get(`/slots?pitchId=${pitchId}&date=${date}`),
};

export const bookingApi = {
  reserve: (body: { pitchId: string; slotId: string; date: string }) =>
    api.post('/reserve-slot', body),
  confirm: (body: { pitchId: string; slotId: string; date: string }) =>
    api.post('/confirm-booking', body),
  getMyBookings: () => api.get('/my-bookings'),
  cancel: (bookingId: string) =>
    api.patch(`/bookings/${bookingId}/cancel`),
};

export default api;
