
export const AuthCallbackLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <div className="bg-white dark:bg-card p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-4 text-lg font-medium" role="status" aria-live="polite">מתחבר למערכת...</div>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true"></div>
      </div>
    </div>
  );
};
