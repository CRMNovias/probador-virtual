/**
 * Dress Service
 * 
 * Handles dress catalog operations:
 * - Get all dresses
 * - Get dress by ID
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { Dress } from '../types/index.js';

/**
 * Get all dresses from catalog
 * @returns Promise with array of dresses
 */
export const getAllDresses = async (): Promise<Dress[]> => {
  const response = await apiClient.get(envConfig.endpoints.dress.getAll);
  return response as Dress[];
};

/**
 * Get dress by ID
 * @param id - Dress ID
 * @returns Promise with dress data
 */
export const getDressById = async (id: string): Promise<Dress> => {
  const response = await apiClient.get(`${envConfig.endpoints.dress.getById}/${id}`);
  return response as Dress;
};
