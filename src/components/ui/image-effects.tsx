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
import { RotateCw, RotateCcw } from "lucide-react";

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
  return (
    <div className="space-y-4 p-4 border rounded-[10px]">
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
        <Select
          value={currentFilter}
          onValueChange={(value: Filter) => onFilterChange(value, currentFilterValue)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="grayscale">Grayscale</SelectItem>
            <SelectItem value="sepia">Sepia</SelectItem>
            <SelectItem value="blur">Blur</SelectItem>
            <SelectItem value="brightness">Brightness</SelectItem>
            <SelectItem value="contrast">Contrast</SelectItem>
          </SelectContent>
        </Select>

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