/**
 * Dress Service
 *
 * NOTE: This service is NOT AVAILABLE in Phase 1.
 * Dress endpoints will be added in Phase 2 when the backend implements them.
 *
 * Handles dress catalog operations:
 * - Get all dresses
 * - Get dress by ID
 */

import type { Dress } from '../types/index.js';

/**
 * Get all dresses from catalog
 * @returns Promise with array of dresses
 * @throws Error - Not available in Phase 1
 */
export const getAllDresses = async (): Promise<Dress[]> => {
  throw new Error('getAllDresses is not available in Phase 1. Will be implemented in Phase 2.');
};

/**
 * Get dress by ID
 * @param id - Dress ID
 * @returns Promise with dress data
 * @throws Error - Not available in Phase 1
 */
export const getDressById = async (_id: string): Promise<Dress> => {
  throw new Error('getDressById is not available in Phase 1. Will be implemented in Phase 2.');
};
