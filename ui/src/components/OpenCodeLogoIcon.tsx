import { cn } from "../lib/utils";

interface OpenCodeLogoIconProps {
  className?: string;
}

export function OpenCodeLogoIcon({ className }: OpenCodeLogoIconProps) {
  return (
    <>
      <img
        src="/brands/IsotipoTaskOrg-light.png"
        alt="TaskOrg"
        className={cn("dark:hidden", className)}
      />
      <img
        src="/brands/IsotipoTaskOrg-Dark.png"
        alt="TaskOrg"
        className={cn("hidden dark:block", className)}
      />
    </>
  );
}
