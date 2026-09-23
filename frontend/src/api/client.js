/**
 * API Client — ES Module for React frontend.
 * Proxied through Vite dev server to Flask backend.
 */

const BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${BASE}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        (data && data.error) ||
        (data && data.errors && data.errors.join('; ')) ||
        `HTTP Error ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  } catch (err) {
    if (!err.status) {
      const networkErr = new Error(
        'Unable to connect to the recommendation service. Please check your network connection or server status.'
      );
      networkErr.status = 0;
      throw networkErr;
    }
    throw err;
  }
}

export const api = {
  // Foods
  getFoods: () => request('/foods'),
  getFoodById: (id) => request(`/foods/${id}`),
  getPresets: () => request('/presets'),

  // Materials
  getMaterials: () => request('/materials'),
  getMaterialById: (id) => request(`/materials/${id}`),

  // Analysis
  analyzePackaging: (payload) =>
    request('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  // History
  getHistory: (limit = 20) => request(`/history?limit=${limit}`),
  getHistoryById: (id) => request(`/history/${id}`),

  // IoT
  postIoTReading: (payload) =>
    request('/iot/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  getIoTReadings: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.device_id) qs.append('device_id', params.device_id);
    if (params.analysis_id) qs.append('analysis_id', params.analysis_id);
    if (params.limit) qs.append('limit', params.limit);
    if (params.start_time) qs.append('start_time', params.start_time);
    if (params.end_time) qs.append('end_time', params.end_time);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/iot/readings${query}`);
  },
  getIoTLatest: (deviceId = null, analysisId = null) => {
    const qs = new URLSearchParams();
    if (deviceId) qs.append('device_id', deviceId);
    if (analysisId) qs.append('analysis_id', analysisId);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/iot/latest${query}`);
  },
  getIoTDevices: () => request('/iot/devices'),
  getIoTStatus: () => request('/iot/status'),
  getIoTAnalysis: (analysisId) => request(`/iot/analysis/${analysisId}`),
};

export default api;
