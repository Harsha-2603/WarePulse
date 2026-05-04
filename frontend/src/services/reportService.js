import api from './api';

const reportService = {
  getSummary: async () => {
    try {
      const response = await api.get('/reports/summary');
      return response.data;
    } catch (error) {
      console.error("Error fetching summary reports:", error);
      throw error;
    }
  },

  getMonthlySales: async () => {
    try {
      const response = await api.get('/reports/monthly-sales');
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      throw error;
    }
  },

  getTopCategories: async () => {
    try {
      const response = await api.get('/reports/top-categories');
      return response.data;
    } catch (error) {
      console.error("Error fetching top categories:", error);
      throw error;
    }
  },

  getMargins: async () => {
    try {
      const response = await api.get('/reports/margins');
      return response.data;
    } catch (error) {
      console.error("Error fetching product margins:", error);
      throw error;
    }
  }
};

export default reportService;
