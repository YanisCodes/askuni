import React from "react";

const variantClasses = {
  primary:
    "bg-slate-800 text-white hover:bg-slate-900 shadow-sm hover:shadow-md",
  secondary:
    "glass text-slate-700 hover:text-slate-900",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 shadow-sm hover:shadow-md",
  ghost:
    "bg-transparent text-slate-500 hover:bg-white/40 hover:text-slate-700",
};

const sizeClasses = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled = false,
  type = "button",
  ...rest
}) {
  const classes = [
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2",
    variantClasses[variant],
    sizeClasses[size],
    disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.97]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
