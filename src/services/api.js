const API_BASE_URL = 'http://localhost:8080/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.token) {
      config.headers.Authorization = `Bearer ${options.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(username, password) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User profile endpoints
  async getUserProfile(token) {
    return this.request('/users/me', {
      method: 'GET',
      token,
    });
  }

  async updateUserProfile(token, profileData) {
    return this.request('/users/me', {
      method: 'PUT',
      token,
      body: JSON.stringify(profileData),
    });
  }
}

export const apiClient = new ApiClient();