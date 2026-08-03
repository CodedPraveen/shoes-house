import { Ring } from "@/components/ui/ring";

export default function Loading() {
    return (
        <div className="flex h-[60vh] items-center justify-center">
            <Ring className="h-15 w-15 text-gray-500" />  
        </div>
    );
}