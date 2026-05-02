import React from "react";

const variantClasses = {
  blue: "bg-primary-100/80 text-primary-700 ring-1 ring-primary-200/70",
  green: "bg-emerald-50/80 text-emerald-700 ring-1 ring-emerald-200/60",
  gray: "bg-primary-50 text-primary-500 ring-1 ring-primary-200/60",
  accent: "bg-accent-500/10 text-accent-600 ring-1 ring-accent-500/25",
};

export default function Badge({ children, variant = "blue", className = "" }) {
  const classes = [
    "inline-flex items-center px-2 py-0.5 text-[11.5px] font-medium rounded-md tracking-tight",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
