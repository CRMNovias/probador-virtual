/**
 * Button Component
 * 
 * Reusable button with variants and states
 * TODO: Implement with:
 * - Variants: primary, secondary, danger
 * - Sizes: sm, md, lg
 * - States: loading, disabled
 * - Full width option
 */

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children }) => {
  return <button>Button Component - TODO: {children}</button>;
};
