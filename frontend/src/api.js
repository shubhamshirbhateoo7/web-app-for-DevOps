import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 10000,
});

export const getProducts = (params = {}) =>
  api.get("/api/products/", { params });

export const getProduct = (slug) =>
  api.get(`/api/products/${slug}/`);

export const getCategories = () =>
  api.get("/api/categories/");

export const healthCheck = () =>
  api.get("/api/health/");

export default api;
