/**
 * useNavigateWithDressId Hook
 *
 * Custom navigation hook that preserves dressId parameter across navigation.
 * Ensures that dressId is always included in the URL when navigating.
 */

import { useNavigate, NavigateOptions } from 'react-router-dom';
import { useApp } from '../context/AppContext.js';

/**
 * Custom navigation hook that automatically appends dressId to navigation URLs
 *
 * @returns Navigate function that preserves dressId
 */
export const useNavigateWithDressId = () => {
  const navigate = useNavigate();
  const { dressId } = useApp();

  /**
   * Navigate to a path, preserving dressId in the URL
   *
   * @param to - Destination path
   * @param options - Navigation options
   */
  const navigateWithDressId = (to: string, options?: NavigateOptions): void => {
    if (!dressId) {
      // No dressId to preserve, navigate normally
      navigate(to, options);
      return;
    }

    // Parse the destination to check if it already has query params
    const [path, existingQuery] = to.split('?');
    const params = new URLSearchParams(existingQuery || '');

    // Add dressId if not already present
    if (!params.has('dressId')) {
      params.set('dressId', dressId);
    }

    // Build final URL
    const finalUrl = `${path}?${params.toString()}`;
    navigate(finalUrl, options);
  };

  return navigateWithDressId;
};
