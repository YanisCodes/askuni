import React from "react";

const variantClasses = {
  primary:
    "bg-primary-800 text-white hover:bg-primary-900 border border-primary-900 shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_1px_2px_rgba(14,13,11,0.2)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_2px_8px_rgba(14,13,11,0.25)]",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 border border-accent-600 shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(125,58,42,0.25)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_2px_10px_rgba(125,58,42,0.3)]",
  secondary:
    "bg-white/70 text-primary-700 hover:text-primary-900 hover:bg-white/90 border border-primary-300/60 hover:border-primary-300",
  danger:
    "bg-accent-600 text-white hover:bg-accent-700 border border-accent-700",
  ghost:
    "bg-transparent text-primary-500 hover:bg-primary-200/40 hover:text-primary-800 border border-transparent",
};

const sizeClasses = {
  sm: "px-3.5 py-1.5 text-[13px]",
  md: "px-4 py-2 text-[13.5px]",
  lg: "px-6 py-2.5 text-[14px]",
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
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-50",
    variantClasses[variant],
    sizeClasses[size],
    disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer active:translate-y-[0.5px]",
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
