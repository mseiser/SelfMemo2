import React from "react";
const NoSearchResults = () => {
  return (
    <div className="text-center mb-4">
      <svg
        className="mx-auto h-16 w-16 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        No results
      </h3>
    </div>
  );
};

export default NoSearchResults;
