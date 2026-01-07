import axiosInstance from '../config/axios';

export const userService = {
  // Get user stats
  getStats: async () => {
    try {
      console.log('📊 Fetching user stats...');
      const response = await axiosInstance.get('/users/stats');
      console.log('✅ Stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      console.log('👥 Fetching all users...');
      const response = await axiosInstance.get('/users/');
      console.log('✅ Users fetched:', response.data.length, 'users');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      console.log('👤 Fetching user:', userId);
      const response = await axiosInstance.get(`/users/${userId}`);
      console.log('✅ User fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      throw error;
    }
  },

  // Create user
  createUser: async (userData) => {
    try {
      console.log('➕ Creating user:', userData.email);
      const response = await axiosInstance.post('/users/', userData);
      console.log('✅ User created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      console.log('✏️ Updating user:', userId);
      const response = await axiosInstance.put(`/users/${userId}`, userData);
      console.log('✅ User updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      console.log('🗑️ Deleting user:', userId);
      const response = await axiosInstance.delete(`/users/${userId}`);
      console.log('✅ User deleted');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  },

  // Activate/Deactivate user
  toggleUserStatus: async (userId, isActive) => {
    try {
      console.log(`${isActive ? '✅' : '❌'} ${isActive ? 'Activating' : 'Deactivating'} user:`, userId);
      const response = await axiosInstance.patch(`/users/${userId}/status`, { is_active: isActive });
      console.log('✅ User status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update user status:', error);
      throw error;
    }
  },
};