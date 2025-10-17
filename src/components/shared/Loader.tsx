/**
 * Loader Component
 * 
 * Loading spinner component
 * TODO: Implement with:
 * - Spinning animation
 * - Optional text message
 * - Center or inline display
 */

interface LoaderProps {
  text?: string;
  inline?: boolean;
}

export const Loader: React.FC<LoaderProps> = () => {
  return <div>Loader Component - TODO</div>;
};
