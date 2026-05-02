import React from "react";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="py-20 flex flex-col items-center text-center animate-fade-in">
      {icon && <div className="text-primary-300 mb-5">{icon}</div>}
      <h3 className="text-[18px] font-semibold text-primary-800 tracking-tight">{title}</h3>
      {description && (
        <p className="text-[13.5px] text-primary-400 mt-2 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
