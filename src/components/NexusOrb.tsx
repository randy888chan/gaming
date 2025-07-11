import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NexusOrbProps extends React.HTMLAttributes<HTMLDivElement> {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export const NexusOrb: React.FC<NexusOrbProps> = ({
  href,
  label,
  icon,
  isActive = false,
  className,
  ...props
}) => {
  return (
    <Link href={href} passHref>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-3 rounded-full cursor-pointer transition-all duration-300 ease-in-out",
          "bg-gradient-to-br from-primary to-secondary text-primary-foreground",
          "hover:scale-110 hover:shadow-2xl",
          isActive ? "scale-110 shadow-2xl ring-4 ring-accent" : "",
          className
        )}
        {...props}
      >
        <div className="text-3xl mb-1">{icon}</div>
        <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
        {isActive && (
          <div className="absolute inset-0 rounded-full ring-4 ring-accent animate-pulse-orb"></div>
        )}
      </div>
    </Link>
  );
};
