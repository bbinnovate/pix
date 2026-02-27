"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MetadataOptions {
  stripAll: boolean;
  keepCopyright: boolean;
  keepDate: boolean;
  keepDimensions: boolean;
}

interface ImageMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  dimensions?: { width: number; height: number };
  exif?: {
    make?: string;
    model?: string;
    dateTime?: string;
    gps?: { latitude?: number; longitude?: number };
    copyright?: string;
    [key: string]: string | number | { latitude?: number; longitude?: number } | undefined;
  };
}

export default function MetadataPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing] = useState(false);
  const [metadata, setMetadata] = useState<ImageMetadata[]>([]);
  const [options, setOptions] = useState<MetadataOptions>({
    stripAll: true,
    keepCopyright: true,
    keepDate: true,
    keepDimensions: true,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imageFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith("image/")
      );
      setFiles(imageFiles);
      await extractMetadata(imageFiles);
    }
  };

  const dropHandler = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const imageFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith("image/")
      );
      setFiles(imageFiles);
      await extractMetadata(imageFiles);
    }
  };

  const dragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const extractMetadata = async (files: File[]) => {
    const metadataList: ImageMetadata[] = [];
    
    for (const file of files) {
      const metadata: ImageMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };

      // Get image dimensions
      try {
        const dimensions = await getImageDimensions(file);
        metadata.dimensions = dimensions;
      } catch (error) {
        console.error("Error getting image dimensions:", error);
      }

      metadataList.push(metadata);
    }

    setMetadata(metadataList);
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
     <div className="min-h-[calc(100vh-160px)] flex justify-center px-6 lg:pt-40  pt-0">
       <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Image Metadata Editor
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
                {files.length} image(s) selected
              </p>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-4 border rounded-[10px] p-4">
                <h3 className="font-semibold">Metadata Stripping Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="strip-all">Strip All Metadata</Label>
                    <Switch
                      id="strip-all"
                      checked={options.stripAll}
                      onCheckedChange={(checked) =>
                        setOptions(prev => ({ ...prev, stripAll: checked }))
                      }
                    />
                  </div>
                  {options.stripAll && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="keep-copyright">Keep Copyright Info</Label>
                        <Switch
                          id="keep-copyright"
                          checked={options.keepCopyright}
                          onCheckedChange={(checked) =>
                            setOptions(prev => ({ ...prev, keepCopyright: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="keep-date">Keep Date/Time</Label>
                        <Switch
                          id="keep-date"
                          checked={options.keepDate}
                          onCheckedChange={(checked) =>
                            setOptions(prev => ({ ...prev, keepDate: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="keep-dimensions">Keep Image Dimensions</Label>
                        <Switch
                          id="keep-dimensions"
                          checked={options.keepDimensions}
                          onCheckedChange={(checked) =>
                            setOptions(prev => ({ ...prev, keepDimensions: checked }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Image Information</h3>
                <div className="space-y-4">
                  {metadata.map((item, index) => (
                    <div key={index} className="border  rounded-[10px] p-4">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>Size: {formatBytes(item.size)}</div>
                        <div>Type: {item.type}</div>
                        <div>Last Modified: {formatDate(item.lastModified)}</div>
                        {item.dimensions && (
                          <div>
                            Dimensions: {item.dimensions.width} x {item.dimensions.height}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {}}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Process Images"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 