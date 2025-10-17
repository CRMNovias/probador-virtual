/**
 * Pose Service
 * 
 * Handles pose catalog operations:
 * - Get all available poses
 */

import { apiClient } from './apiClient.js';
import { envConfig } from '../config/envConfig.js';
import type { Pose } from '../types/index.js';

/**
 * Get all available poses
 * @returns Promise with array of poses
 */
export const getAllPoses = async (): Promise<Pose[]> => {
  const response = await apiClient.get(envConfig.endpoints.pose.getAll);
  return response as Pose[];
};
