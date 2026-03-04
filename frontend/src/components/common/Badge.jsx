import React from "react";

const variantClasses = {
  blue: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/60",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  gray: "bg-slate-50 text-slate-500 ring-1 ring-slate-200/60",
};

export default function Badge({ children, variant = "blue", className = "" }) {
  const classes = [
    "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-lg",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
