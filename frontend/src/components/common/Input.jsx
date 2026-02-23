import React from "react";

export default function Input({ label, id, error, className = "", ...rest }) {
  const inputClasses = [
    "w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors",
    error ? "border-red-500" : "border-secondary-300",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input id={id} className={inputClasses} {...rest} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
