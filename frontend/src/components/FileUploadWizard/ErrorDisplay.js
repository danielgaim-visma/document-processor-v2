import React from 'react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-600 text-white rounded-md">
      {error}
    </div>
  );
};

export default ErrorDisplay;