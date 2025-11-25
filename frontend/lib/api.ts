import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler wrapper
const handleError = (error: any) => {
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw error;
};

export const api = {
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
