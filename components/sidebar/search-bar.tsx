"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input type="text" placeholder="Search conversations..." value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
    </div>
  );
}
