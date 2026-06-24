"use client";

import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function SortSelect({ value, onChange }) {
  return (
    <div className="relative">

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[190px] h-12 p-5 no54123-full ">
          <SelectValue />
        </SelectTrigger>

        <SelectContent className="no54123-2xl p-2 w-[195px] ">
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="low-high">Price Low to High</SelectItem>
          <SelectItem value="high-low">Price High to Low</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}



