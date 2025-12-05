/**
 * Pose-related types
 * 
 * Interfaces for pose catalog items
 */

/**
 * Avatar pose option
 */
export interface Pose {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  thumbnailUrl?: string;
}

/**
 * Pose category
 */
export interface PoseCategory {
  id: string;
  name: string;
  description: string;
  poses: Pose[];
}
