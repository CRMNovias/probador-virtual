/**
 * AppContext
 * 
 * Global application state context
 * TODO: Implement in Phase 2
 */

/**
 * This will provide:
 * - currentAvatar: Avatar | null
 * - selectedDress: Dress | null
 * - selectedPose: Pose | null
 * - setters for the above
 */

export const AppContext: React.Context<unknown> = {} as React.Context<unknown>;
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};
