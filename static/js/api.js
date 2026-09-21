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
};

window.API = API;
