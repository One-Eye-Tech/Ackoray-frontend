import apiClient from './apiConfig'; // Assuming your main apiClient is configured in apiConfig.js

const COLORS_BASE_URL = '/colors';
const SIZES_BASE_URL = '/sizes';

// --- Color APIs ---
export const getAllColorsApi = () => {
  return apiClient.get(COLORS_BASE_URL);
};

export const getColorByIdApi = (id) => {
  return apiClient.get(`${COLORS_BASE_URL}/${id}`);
};

export const createColorApi = (colorData) => { // colorData should be ColorCreateDto
  return apiClient.post(COLORS_BASE_URL, colorData);
};

export const updateColorApi = (id, colorData) => { // colorData should be ColorUpdateDto
  return apiClient.put(`${COLORS_BASE_URL}/${id}`, colorData);
};

export const deleteColorApi = (id) => {
  return apiClient.delete(`${COLORS_BASE_URL}/${id}`);
};

// --- Size APIs ---
export const getAllSizesApi = () => {
  return apiClient.get(SIZES_BASE_URL);
};

export const getSizeByIdApi = (id) => {
  return apiClient.get(`${SIZES_BASE_URL}/${id}`);
};

export const createSizeApi = (sizeData) => { // sizeData should be SizeCreateDto
  return apiClient.post(SIZES_BASE_URL, sizeData);
};

export const updateSizeApi = (id, sizeData) => { // sizeData should be SizeUpdateDto
  return apiClient.put(`${SIZES_BASE_URL}/${id}`, sizeData);
};

export const deleteSizeApi = (id) => {
  return apiClient.delete(`${SIZES_BASE_URL}/${id}`);
}; 