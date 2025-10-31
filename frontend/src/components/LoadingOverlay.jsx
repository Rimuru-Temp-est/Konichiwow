import React from "react";

const LoadingOverlay = ({ show, text = "Loading..." }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      aria-hidden={!show}
    >
      <div className="bg-white/95 p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)" strokeWidth="4"></circle>
          <path
            d="M22 12a10 10 0 00-10-10"
            stroke="#7C4A2E"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        <div className="text-sm text-gray-700">{text}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
