"use client";

import { Input } from "@/components/ui/input";

interface FlatInputProps {
  index: number;
  flat: { name: string; reading: number };
  updateFlatReading: (index: number, value: number) => void;
}

export default function FlatInput({ index, flat, updateFlatReading }: FlatInputProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-3">
        {flat.name} Reading (units):
      </h3>
      <Input
        type="number"
        value={flat.reading.toString()}
        onChange={(e) =>
          updateFlatReading(index, parseFloat(e.target.value))
        }
        step="0.01"
        min="0"
      />
    </div>
  );
}
