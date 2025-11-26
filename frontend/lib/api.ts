import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Error handler wrapper
const handleError = (error: any) => {
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw error;
};

export const api = {
  // Auth endpoints
  register: async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  login: async (credentials: any) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/current-user');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/auth/users');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Dashboard endpoints
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Expense endpoints
  getExpenses: async () => {
    try {
      const response = await apiClient.get('/expenses');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  addExpense: async (expense: any) => {
    try {
      const response = await apiClient.post('/expenses', expense);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Group endpoints
  getGroups: async () => {
    try {
      const response = await apiClient.get('/groups');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  addGroup: async (group: any) => {
    try {
      const response = await apiClient.post('/groups', group);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  addMembersToGroup: async (groupId: string, memberIds: string[]) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/members`, { member_ids: memberIds });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Transaction endpoints
  getTransactions: async () => {
    try {
      const response = await apiClient.get('/transactions');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Wallet endpoints
  getWallet: async () => {
    try {
      const response = await apiClient.get('/wallet');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  loadBalance: async (amount: number) => {
    try {
      const response = await apiClient.post('/wallet/load', { amount });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};
