"use client";

import * as React from "react";
import { Slider } from "./slider";
import { Label } from "./label";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { RotateCw, RotateCcw, ChevronDown } from "lucide-react";
import { useState } from "react";

export type Filter = "none" | "grayscale" | "sepia" | "blur" | "brightness" | "contrast";

interface ImageEffectsProps {
  onRotate: (degrees: number) => void;
  onFilterChange: (filter: Filter, value: number) => void;
  currentRotation: number;
  currentFilter: Filter;
  currentFilterValue: number;
}

export function ImageEffects({
  onRotate,
  onFilterChange,
  currentRotation,
  currentFilter,
  currentFilterValue,
}: ImageEffectsProps) {


  const [isFilterOpen, setIsFilterOpen] = useState(false);

const filterOptions = [
  { value: "none", label: "None" },
  { value: "grayscale", label: "Grayscale" },
  { value: "sepia", label: "Sepia" },
  { value: "blur", label: "Blur" },
  { value: "brightness", label: "Brightness" },
  { value: "contrast", label: "Contrast" },
];
  return (
    <div className="space-y-4  rounded-[10px]">
      <div className="space-y-2">
        <Label>Rotation</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRotate((currentRotation - 90) % 360)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRotate((currentRotation + 90) % 360)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            {currentRotation}°
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Filter</Label>
       <div className="relative isolate">
  <button
    type="button"
    onClick={() => setIsFilterOpen((prev) => !prev)}
    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all hover:border-gray-400 focus:outline-none"
  >
    <span className="font-medium">
      {
        filterOptions.find(
          (item) => item.value === currentFilter
        )?.label
      }
    </span>

    <ChevronDown
      className={`h-4 w-4 transition-transform duration-200 ${
        isFilterOpen ? "rotate-180" : ""
      }`}
    />
  </button>

  {isFilterOpen && (
<div className="absolute left-0 top-[calc(100%+8px)] z-[99999] w-full rounded-xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">      <div className="max-h-[260px] overflow-y-auto p-1">
      
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onFilterChange(
                option.value as Filter,
                currentFilterValue
              );

              setIsFilterOpen(false);
            }}
             className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-all ${
              currentFilter === option.value
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
           
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )}
</div>

        {currentFilter !== "none" && (
          <div className="space-y-2">
            <Label>Intensity</Label>
            <Slider
              value={[currentFilterValue]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => onFilterChange(currentFilter, value)}
            />
          </div>
        )}
      </div>
    </div>
  );
} 