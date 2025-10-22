/**
 * Dress-related types
 * 
 * Interfaces for dress catalog items
 */

/**
 * Wedding dress item
 */
export interface Dress {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  designer?: string;
  collection?: string;
  available: boolean;
}

/**
 * Dress category/collection
 */
export interface DressCollection {
  id: string;
  name: string;
  description: string;
  dresses: Dress[];
}
