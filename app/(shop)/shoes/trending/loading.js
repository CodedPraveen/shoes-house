import { Ring } from "@/components/ui/ring";

export default function Loading() {
    return (
        <div className="flex h-[60vh] items-center justify-center">
            {/* <Ring /> */}
            {/* <Ring className="h-6 w-6" />    // Small */}
            {/* <Ring className="h-8 w-8" />    // Medium*/}
            {/* <Ring className="h-10 w-10" />  */}
            <Ring className="h-12 w-12 text-gray-500" />  
        </div>
    );
}