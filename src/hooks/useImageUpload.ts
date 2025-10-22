/**
 * Image Upload Hook
 * 
 * Custom hook for handling image uploads with progress tracking
 */

import { useState, useCallback } from 'react';
import { isAllowedImageType, isFileSizeValid } from '../config/appConfig.js';
import { errorMessages } from '../constants/errorMessages.js';

/**
 * Image upload state
 */
interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Hook for image upload with validation and progress
 * @returns Upload utilities
 */
export const useImageUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  /**
   * Validate image file
   */
  const validateImage = useCallback((file: File): string | null => {
    if (!isAllowedImageType(file)) {
      return errorMessages.INVALID_FILE_TYPE;
    }

    if (!isFileSizeValid(file)) {
      return errorMessages.FILE_TOO_LARGE;
    }

    return null;
  }, []);

  /**
   * Upload image file
   */
  const uploadImage = useCallback(
    async <T,>(file: File, uploadFunction: (file: File) => Promise<T>): Promise<T | null> => {
      // Validate file first
      const validationError = validateImage(file);
      if (validationError) {
        setUploadState({
          isUploading: false,
          progress: 0,
          error: validationError,
        });
        return null;
      }

      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
      });

      try {
        // TODO: Track actual upload progress
        setUploadState((prev) => ({ ...prev, progress: 50 }));

        const result = await uploadFunction(file);

        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : errorMessages.UPLOAD_FAILED;
        setUploadState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
        });
        return null;
      }
    },
    [validateImage]
  );

  const reset = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    ...uploadState,
    validateImage,
    uploadImage,
    reset,
  };
};
