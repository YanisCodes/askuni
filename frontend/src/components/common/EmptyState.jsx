import React from "react";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      {icon && <div className="text-secondary-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
