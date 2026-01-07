import axiosInstance from '../config/axios';

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      console.log('✅ Login response:', response.data);
      
      // Save token to localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        console.log('💾 Token saved to localStorage');
      }
      
      // Save user to localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('💾 User saved to localStorage:', response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      
      // Throw a user-friendly error message
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Invalid email or password';
      
      throw new Error(errorMessage);
    }
  },

  // Signup
  signup: async (userData) => {
    try {
      console.log('📝 Attempting signup:', userData.email);
      
      const response = await axiosInstance.post('/auth/signup', userData);
      
      console.log('✅ Signup successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Signup failed:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Signup failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  },

  // Logout
  logout: () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Logged out successfully');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('❌ Failed to parse user from localStorage');
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    console.log('🔐 Is authenticated:', hasToken);
    return hasToken;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },
};