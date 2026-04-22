"use client";

import { type ReactNode, type HTMLAttributes, type MouseEvent } from "react";
import { useWaitlist } from "./WaitlistProvider";

type Props = {
  children: ReactNode;
  className?: string;
  source?: string;
  as?: "button" | "span";
  onClick?: (e: MouseEvent<HTMLElement>) => void;
} & Omit<HTMLAttributes<HTMLButtonElement>, "onClick" | "children">;

/**
 * Drop-in replacement for <a href="/signup"> CTAs.
 * Opens the waitlist modal instead of navigating to the blocked signup page.
 * Any onClick passed by the caller fires first (e.g., posthog tracking),
 * then the modal opens.
 */
export default function WaitlistCTA({
  children,
  className,
  source = "landing",
  as = "button",
  onClick,
  ...rest
}: Props) {
  const { open } = useWaitlist();

  const handle = (e: MouseEvent<HTMLElement>) => {
    onClick?.(e);
    open(source);
  };

  if (as === "span") {
    return (
      <span
        role="button"
        tabIndex={0}
        className={className}
        onClick={handle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(source);
          }
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <button type="button" onClick={handle} className={className} {...rest}>
      {children}
    </button>
  );
}
