import React from "react";

export default function Input({ label, id, error, className = "", ...rest }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-medium text-primary-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-glass ${error ? "!border-accent-500" : ""} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-[12.5px] text-accent-600">{error}</p>}
    </div>
  );
}
