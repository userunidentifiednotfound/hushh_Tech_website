import React from "react";

export type ArrowForwardIconProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

export default function ArrowForwardIcon({
  className = "",
  "aria-hidden": ariaHidden = true,
}: ArrowForwardIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

