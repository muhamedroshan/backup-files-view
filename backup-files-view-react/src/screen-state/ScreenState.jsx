import React from "react";

const ScreenState = ({ loading = false, error = null }) => {
  if (!loading && !error) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {loading && (
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-blue-600 font-medium">Loading...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 w-full max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default ScreenState;
