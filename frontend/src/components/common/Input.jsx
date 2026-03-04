import React from "react";

export default function Input({ label, id, error, className = "", ...rest }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-glass ${error ? "!border-rose-400 !ring-rose-200" : ""} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-sm text-rose-500">{error}</p>}
    </div>
  );
}
