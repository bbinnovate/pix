"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

export default function Resize() {
  const [files, setFiles] = useState<File[]>([]);
  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    width: 800,
    height: 600,
    maintainAspectRatio: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const dropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const dragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          let targetWidth = resizeOptions.width;
          let targetHeight = resizeOptions.height;

          if (resizeOptions.maintainAspectRatio) {
            const ratio = Math.min(
              resizeOptions.width / img.width,
              resizeOptions.height / img.height
            );
            targetWidth = img.width * ratio;
            targetHeight = img.height * ratio;
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Draw resized image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          canvas.toBlob(
            (blob) => {
              resolve(blob as Blob);
            },
            "image/jpeg",
            0.9
          );
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const processImages = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const zip = new JSZip();
    const folder = zip.folder("resized-images");

    try {
      for (const file of files) {
        const resizedBlob = await resizeImage(file);
        folder?.file(file.name, resizedBlob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "resized-images.zip");
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex justify-center px-6 lg:pt-40  pt-0">
       <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Image Resizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center mb-4"
            onDrop={dropHandler}
            onDragOver={dragOverHandler}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer text-primary hover:text-primary/80"
            >
              Click to upload
            </label>{" "}
            or drag and drop your images here
            {files.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {files.length} file(s) selected
              </p>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={resizeOptions.width}
                    onChange={(e) =>
                      setResizeOptions((prev) => ({
                        ...prev,
                        width: Number(e.target.value),
                      }))
                    }
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={resizeOptions.height}
                    onChange={(e) =>
                      setResizeOptions((prev) => ({
                        ...prev,
                        height: Number(e.target.value),
                      }))
                    }
                    min={1}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="aspect-ratio"
                  checked={resizeOptions.maintainAspectRatio}
                  onCheckedChange={(checked) =>
                    setResizeOptions((prev) => ({
                      ...prev,
                      maintainAspectRatio: checked,
                    }))
                  }
                />
                <Label htmlFor="aspect-ratio">Maintain aspect ratio</Label>
              </div>

              <Button
                className="w-full"
                onClick={processImages}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Resize Images"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 