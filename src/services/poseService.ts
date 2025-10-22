/**
 * Pose Service
 *
 * NOTE: This service is NOT AVAILABLE in Phase 1.
 * Pose endpoints will be added in Phase 2 when the backend implements them.
 *
 * Handles pose catalog operations:
 * - Get all available poses
 */

import type { Pose } from '../types/index.js';

/**
 * Get all available poses
 * @returns Promise with array of poses
 * @throws Error - Not available in Phase 1
 */
export const getAllPoses = async (): Promise<Pose[]> => {
  throw new Error('getAllPoses is not available in Phase 1. Will be implemented in Phase 2.');
};
