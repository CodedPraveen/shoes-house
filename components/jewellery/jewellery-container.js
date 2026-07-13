import { cn } from "@/lib/utils";

export default function JewelleryContainer({ children, className = "" }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-4 md:px-16", className)}>
      {children}
    </div>
  );
}
