import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional hover effect. When true, the card lifts slightly on hover.
   */
  hoverable?: boolean;
}

/**
 * Simple Card wrapper component that provides a white background, rounded corners,
 * and optional hover lift effect. Used throughout the e‑commerce UI for product
 * cards, category cards, and promotional banners.
 */
export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = "",
  ...rest
}) => {
  const hoverClass = hoverable ? "transform transition-transform hover:-translate-y-1" : "";
  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${hoverClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

