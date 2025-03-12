
export const EventsLoadingState = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center py-10 animate-pulse">
      <div className="flex flex-col items-center justify-center">
        <div className="h-6 w-6 bg-primary/30 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>
        <p className="text-gray-500">טוען אירועים...</p>
      </div>
    </div>
  );
};
