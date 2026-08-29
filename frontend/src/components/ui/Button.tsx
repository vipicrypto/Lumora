import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Optional variant for styling. Currently supports "primary" and "secondary".
   */
  variant?: "primary" | "secondary";
  /**
   * Optional size for the button. Supports "sm", "md", "lg".
   */
  size?: "sm" | "md" | "lg";
  /**
   * Optional element type to render. Defaults to "button". When set to "a",
   * additional anchor props like href are allowed.
   */
  as?: "button" | "a";
  /**
   * When rendering as an anchor (as="a"), you can provide an href.
   */
  href?: string;
}

/**
 * Reusable button component that uses Tailwind CSS for styling.
 * It provides sensible defaults for a modern e‑commerce UI.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  className = "",
  ...rest
}) => {
  const baseClasses = "rounded transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary: "bg-foreground text-background hover:bg-gray-800",
    secondary: "bg-gray-200 text-foreground hover:bg-gray-300",
  }[variant];
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }[size];

  const sharedProps = {
    className: `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`,
    ...rest,
  } as any;

  if (as === "a") {
    // When rendering as an anchor, ensure href is passed via rest.
    return <a {...sharedProps}>{children}</a>;
  }
  // Default to button element.
  return <button {...sharedProps}>{children}</button>;
};
