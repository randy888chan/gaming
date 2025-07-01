import React from "react";
import { cn } from "@/lib/utils";

interface InsightShardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const InsightShard: React.FC<InsightShardProps> = ({
  title,
  value,
  icon,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105",
        className,
      )}
      {...props}
    >
      {icon && <div className="mb-2 text-primary">{icon}</div>}
      <p className="text-sm text-muted-foreground">{title}</p>
      <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    </div>
  );
};