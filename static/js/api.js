/**
 * API Client module for Smart Food Packaging Recommendation System.
 * Connects frontend views to backend REST endpoints.
 */

const API = {
  /**
   * Universal fetch wrapper with structured error handling.
   */
  async request(endpoint, options = {}) {
    const config = {
      headers: {
        "Accept": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = (data && data.error) || (data && data.errors && data.errors.join("; ")) || `HTTP Error ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (!err.status) {
        // Network or fetch failure
        const networkErr = new Error("Unable to connect to the recommendation service. Please check your network connection or server status.");
        networkErr.status = 0;
        throw networkErr;
      }
      throw err;
    }
  },

  /**
   * Retrieve all food commodities.
   */
  async getFoods() {
    return this.request("/api/foods");
  },

  /**
   * Retrieve single food by ID.
   */
  async getFoodById(id) {
    return this.request(`/api/foods/${id}`);
  },

  /**
   * Retrieve food presets for quick input testing.
   */
  async getPresets() {
    return this.request("/api/presets");
  },

  /**
   * Retrieve all packaging materials.
   */
  async getMaterials() {
    return this.request("/api/materials");
  },

  /**
   * Retrieve single material by ID.
   */
  async getMaterialById(id) {
    return this.request(`/api/materials/${id}`);
  },

  /**
   * Submit food properties for hybrid packaging recommendation.
   */
  async analyzePackaging(payload) {
    return this.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retrieve historical recommendation analyses.
   */
  async getHistory(limit = 20) {
    return this.request(`/api/history?limit=${limit}`);
  },

  /**
   * Retrieve single historical recommendation by ID.
   */
  async getHistoryById(id) {
    return this.request(`/api/history/${id}`);
  },

  // =========================================================================
  // IoT Telemetry & Monitoring Endpoints
  // =========================================================================

  /**
   * Ingest a new sensor reading.
   */
  async postIoTReading(payload) {
    return this.request("/api/iot/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Query historical IoT sensor readings.
   */
  async getIoTReadings(params = {}) {
    const qs = new URLSearchParams();
    if (params.device_id) qs.append("device_id", params.device_id);
    if (params.analysis_id) qs.append("analysis_id", params.analysis_id);
    if (params.limit) qs.append("limit", params.limit);
    if (params.start_time) qs.append("start_time", params.start_time);
    if (params.end_time) qs.append("end_time", params.end_time);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return this.request(`/api/iot/readings${query}`);
  },

  /**
   * Fetch the most recent IoT sensor reading and evaluation.
   */
  async getIoTLatest(deviceId = null, analysisId = null) {
    const qs = new URLSearchParams();
    if (deviceId) qs.append("device_id", deviceId);
    if (analysisId) qs.append("analysis_id", analysisId);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return this.request(`/api/iot/latest${query}`);
  },

  /**
   * Fetch list of active/known IoT microcontrollers.
   */
  async getIoTDevices() {
    return this.request("/api/iot/devices");
  },

  /**
   * Fetch system-level IoT telemetry status.
   */
  async getIoTStatus() {
    return this.request("/api/iot/status");
  },

  /**
   * Fetch real-time monitoring and comparison for a specific analysis ID.
   */
  async getIoTAnalysis(analysisId) {
    return this.request(`/api/iot/analysis/${analysisId}`);
  },
};

window.API = API;
window.ApiClient = API;

