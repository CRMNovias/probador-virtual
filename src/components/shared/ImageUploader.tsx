/**
 * ImageUploader Component
 * 
 * Image upload widget with drag-and-drop
 * TODO: Implement with:
 * - Drag and drop area
 * - File input button
 * - Image preview
 * - Upload progress
 * - Validation (type, size)
 */

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = () => {
  return <div>ImageUploader Component - TODO</div>;
};
