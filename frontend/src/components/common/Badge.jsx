import React from "react";

const variantClasses = {
  blue: "bg-primary-100 text-primary-800",
  green: "bg-green-100 text-green-800",
  gray: "bg-secondary-200 text-gray-700",
};

export default function Badge({ children, variant = "blue", className = "" }) {
  const classes = [
    "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
