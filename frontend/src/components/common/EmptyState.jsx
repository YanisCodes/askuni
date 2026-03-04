import React from "react";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="py-16 flex flex-col items-center text-center animate-fade-in-up">
      {icon && <div className="text-slate-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
