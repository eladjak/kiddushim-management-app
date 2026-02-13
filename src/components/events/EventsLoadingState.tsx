
export const EventsLoadingState = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center py-10 animate-pulse">
      <div className="flex flex-col items-center justify-center">
        <div className="h-8 w-8 bg-primary/30 rounded-full mb-5" aria-hidden="true"></div>
        <div className="h-5 w-40 bg-gray-200 rounded mb-8" aria-hidden="true"></div>
        <p className="text-gray-500 text-lg" role="status" aria-live="polite">טוען אירועים...</p>
      </div>
    </div>
  );
};
