"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import {  Filter } from "@/components/ui/image-effects";
import Image from "next/image";
import { clsx } from 'clsx';

type CompressionLevel = "1x" | "2x" | "3x" | "4x" | "custom";
type WatermarkPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
type WatermarkType = "text" | "logo";
type RenamePattern = "original" | "datetime" | "sequence" | "custom";

interface ImageMetadata {
  width: number;
  height: number;
  orientation?: number;
  rotation?: number;
  filter?: Filter;
  filterValue?: number;
}

const Compress = () => {
     const [files, setFiles] = useState<File[]>([]);
      const [progress, setProgress] = useState(0);
      const [isProcessing, setIsProcessing] = useState(false);
      const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("1x");
      const [enableWatermark, setEnableWatermark] = useState(false);
      const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
      const [watermarkText, setWatermarkText] = useState("");
      const [watermarkLogo, setWatermarkLogo] = useState<File | null>(null);
      const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>("bottom-right");
      const [previewOpen, setPreviewOpen] = useState(false);
      const [previewImages, setPreviewImages] = useState<string[]>([]);
      const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
      const [processedBlobs, setProcessedBlobs] = useState<Blob[]>([]);
    
      const [customQuality, setCustomQuality] = useState(80);
      const [customMaxSize, setCustomMaxSize] = useState(1920);
      const [renamePattern, setRenamePattern] = useState<RenamePattern>("original");
      const [customNamePattern, setCustomNamePattern] = useState("");
      const [imageMetadata, setImageMetadata] = useState<ImageMetadata[]>([]);
      const [showThumbnails, setShowThumbnails] = useState(true);
      const [currentImageEffects] = useState<{
        rotation: number;
        filter: Filter;
        filterValue: number;
      }>({
        rotation: 0,
        filter: "none",
        filterValue: 50,
      });
    
      const handleClosePreview = useCallback(() => {
        previewImages.forEach(URL.revokeObjectURL);
        setPreviewImages([]);
        setProcessedBlobs([]);
        setPreviewOpen(false);
        setCurrentPreviewIndex(0);
      }, [previewImages]);
    
      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (!previewOpen) return;
    
          switch (e.key) {
            case "ArrowLeft":
              setCurrentPreviewIndex((prev) => 
                prev > 0 ? prev - 1 : previewImages.length - 1
              );
              break;
            case "ArrowRight":
              setCurrentPreviewIndex((prev) => 
                prev < previewImages.length - 1 ? prev + 1 : 0
              );
              break;
            case "Escape":
              handleClosePreview();
              break;
          }
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
      }, [previewOpen, previewImages.length, handleClosePreview]);
    
      const getImageMetadata = (file: File): Promise<ImageMetadata> => {
        return new Promise((resolve) => {
          const img = new window.Image();
          const url = URL.createObjectURL(file);
    
          img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
              width: img.width,
              height: img.height,
              orientation: 1, // Default orientation
              rotation: 0,
              filter: "none",
              filterValue: 50,
            });
          };
    
          img.src = url;
        });
      };
    
      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          const selectedFiles = Array.from(e.target.files);
          setFiles(selectedFiles);
    
          // Get metadata for all files
          const metadata = await Promise.all(
            selectedFiles.map(file => getImageMetadata(file))
          );
          setImageMetadata(metadata);
        }
      };
    
      const getCompressionSettings = (level: CompressionLevel) => {
        if (level === "custom") {
          return {
            maxSize: customMaxSize,
            quality: customQuality / 100,
          };
        }
    
        const settings = {
          "1x": { maxSize: 1920, quality: 0.8 },
          "2x": { maxSize: 1440, quality: 0.7 },
          "3x": { maxSize: 1080, quality: 0.6 },
          "4x": { maxSize: 800, quality: 0.5 },
        };
        return settings[level];
      };
    
      const generateFileName = (originalName: string, index: number): string => {
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, "-");
        const ext = originalName.split(".").pop();
        const baseName = originalName.split(".").slice(0, -1).join(".");
    
        switch (renamePattern) {
          case "datetime":
            return `${baseName}_${timestamp}.${ext}`;
          case "sequence":
            return `image_${String(index + 1).padStart(3, "0")}.${ext}`;
          case "custom":
            return `${customNamePattern.replace("{name}", baseName)}
                                     .replace("{n}", String(index + 1).padStart(3, "0")}
                                     .replace("{date}", timestamp)}.${ext}`;
          default:
            return originalName;
        }
      };
    
      const addWatermarkLogo = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        logo: File,
        position: WatermarkPosition
      ): Promise<void> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              ctx.save();
              
              // Calculate logo size (max 15% of the smaller canvas dimension)
              const maxSize = Math.min(canvas.width, canvas.height) * 0.15;
              let logoWidth = img.width;
              let logoHeight = img.height;
              
              if (logoWidth > logoHeight) {
                if (logoWidth > maxSize) {
                  logoHeight = (logoHeight * maxSize) / logoWidth;
                  logoWidth = maxSize;
                }
              } else {
                if (logoHeight > maxSize) {
                  logoWidth = (logoWidth * maxSize) / logoHeight;
                  logoHeight = maxSize;
                }
              }
    
              // Calculate position
              const padding = 20;
              let x = 0;
              let y = 0;
    
              switch (position) {
                case "top-left":
                  x = padding;
                  y = padding;
                  break;
                case "top-right":
                  x = canvas.width - logoWidth - padding;
                  y = padding;
                  break;
                case "bottom-left":
                  x = padding;
                  y = canvas.height - logoHeight - padding;
                  break;
                case "bottom-right":
                  x = canvas.width - logoWidth - padding;
                  y = canvas.height - logoHeight - padding;
                  break;
                case "center":
                  x = (canvas.width - logoWidth) / 2;
                  y = (canvas.height - logoHeight) / 2;
                  break;
              }
    
              // Draw logo with slight transparency
              ctx.globalAlpha = 0.5;
              ctx.drawImage(img, x, y, logoWidth, logoHeight);
              ctx.restore();
              resolve();
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(logo);
        });
      };
    
      const addWatermarkText = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        text: string,
        position: WatermarkPosition
      ) => {
        if (!text) return;
    
        ctx.save();
        
        // Set watermark style
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        
        // Calculate text metrics
        const metrics = ctx.measureText(text);
        const padding = 20;
        
        // Calculate position
        let x = 0;
        let y = 0;
        
        switch (position) {
          case "top-left":
            x = padding;
            y = padding + 24;
            break;
          case "top-right":
            x = canvas.width - metrics.width - padding;
            y = padding + 24;
            break;
          case "bottom-left":
            x = padding;
            y = canvas.height - padding;
            break;
          case "bottom-right":
            x = canvas.width - metrics.width - padding;
            y = canvas.height - padding;
            break;
          case "center":
            x = (canvas.width - metrics.width) / 2;
            y = canvas.height / 2;
            break;
        }
        
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.restore();
      };
    
      
    
      const applyImageEffects = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
      ) => {
        // Apply rotation
        if (currentImageEffects.rotation !== 0) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((currentImageEffects.rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
        }
    
        // Apply filters
        if (currentImageEffects.filter !== "none") {
          const value = currentImageEffects.filterValue / 100;
          switch (currentImageEffects.filter) {
            case "grayscale":
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
              }
              ctx.putImageData(imageData, 0, 0);
              break;
            case "sepia":
              ctx.filter = `sepia(${value})`;
              break;
            case "blur":
              ctx.filter = `blur(${value * 10}px)`;
              break;
            case "brightness":
              ctx.filter = `brightness(${value * 2})`;
              break;
            case "contrast":
              ctx.filter = `contrast(${value * 2}%)`;
              break;
          }
        }
      };
    
      const compressImage = async (file: File): Promise<Blob> => {
        const settings = getCompressionSettings(compressionLevel);
        
        return new Promise((resolve) => {
          const img = new window.Image();
          const url = URL.createObjectURL(file);
    
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
    
            // Get image metadata
            const metadata = imageMetadata[files.indexOf(file)];
            
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;
            const maxSize = settings.maxSize;
    
            if (width > height && width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
    
            canvas.width = width;
            canvas.height = height;
    
            // Apply orientation fix if needed
            if (metadata?.orientation) {
              ctx.save();
              switch (metadata.orientation) {
                case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
                case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
                case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
                case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
                case 7: ctx.transform(0, -1, -1, 0, height, width); break;
                case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
              }
            }
    
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            // Add watermark if enabled
            if (enableWatermark) {
              if (watermarkType === "text" && watermarkText) {
                addWatermarkText(ctx, canvas, watermarkText, watermarkPosition);
              } else if (watermarkType === "logo" && watermarkLogo) {
                await addWatermarkLogo(ctx, canvas, watermarkLogo, watermarkPosition);
              }
            }
    
            if (metadata?.orientation) {
              ctx.restore();
            }
    
            // Apply image effects before compression
            applyImageEffects(ctx, canvas);
    
            canvas.toBlob(
              (blob) => {
                resolve(blob as Blob);
              },
              "image/jpeg",
              settings.quality
            );
          };
          img.src = url;
        });
      };
    
      const processImages = async () => {
        if (files.length === 0) return;
    
        setIsProcessing(true);
        setProgress(0);
        const processed: Blob[] = [];
        const previews: string[] = [];
    
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const compressedBlob = await compressImage(file);
          processed.push(compressedBlob);
          
          // Create preview URLs for the first 5 images
          if (i < 5) {
            const previewUrl = URL.createObjectURL(compressedBlob);
            previews.push(previewUrl);
          }
          
          setProgress(((i + 1) / files.length) * 100);
        }
    
        setProcessedBlobs(processed);
        setPreviewImages(previews);
        setCurrentPreviewIndex(0);
        setPreviewOpen(true);
        setIsProcessing(false);
      };
    
      const handleDownload = async () => {
        const zip = new JSZip();
        const processedFiles = zip.folder("compressed-images");
    
        processedBlobs.forEach((blob, index) => {
          processedFiles?.file(generateFileName(files[index].name, index), blob);
        });
    
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `compressed-images-${compressionLevel}.zip`);
        
        // Clean up preview URLs
        previewImages.forEach(URL.revokeObjectURL);
        setPreviewImages([]);
        setProcessedBlobs([]);
        setPreviewOpen(false);
      };
    
      const dropHandler = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
          setFiles(Array.from(e.dataTransfer.files));
        }
      }, []);
    
      const dragOverHandler = useCallback((e: React.DragEvent) => {
        e.preventDefault();
      }, []);
  return (
  <div className="min-h-[calc(100vh-160px)] flex justify-center px-6 lg:pt-40  pt-0">
    <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Bulk Image Compression & Watermarking
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
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="compression-level">Compression Level</Label>
                      <Select
                        value={compressionLevel}
                        onValueChange={(value: string) => setCompressionLevel(value as CompressionLevel)}
                      >
                        <SelectTrigger id="compression-level">
                          <SelectValue placeholder="Select compression level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1x">1x (Light) - 1920px, 80% quality</SelectItem>
                          <SelectItem value="2x">2x (Medium) - 1440px, 70% quality</SelectItem>
                          <SelectItem value="3x">3x (High) - 1080px, 60% quality</SelectItem>
                          <SelectItem value="4x">4x (Maximum) - 800px, 50% quality</SelectItem>
                          <SelectItem value="custom">Custom Settings</SelectItem>
                        </SelectContent>
                      </Select>
    
                      {compressionLevel === "custom" && (
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label>Quality ({customQuality}%)</Label>
                            </div>
                            <Slider
                              value={[customQuality]}
                              onValueChange={(value) => setCustomQuality(value[0])}
                              min={1}
                              max={100}
                              step={1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Dimension (px)</Label>
                            <Input
                              type="number"
                              value={customMaxSize}
                              onChange={(e) => setCustomMaxSize(Number(e.target.value))}
                              min={100}
                              max={4000}
                            />
                          </div>
                        </div>
                      )}
                    </div>
    
                    <div className="border-t pt-4">
                      <Label>File Naming</Label>
                      <RadioGroup
                        value={renamePattern}
                        onValueChange={(value: RenamePattern) => setRenamePattern(value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="original" id="original" />
                          <Label htmlFor="original">Keep Original Names</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="datetime" id="datetime" />
                          <Label htmlFor="datetime">Add Date/Time</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sequence" id="sequence" />
                          <Label htmlFor="sequence">Sequential Numbering</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom-pattern" />
                          <Label htmlFor="custom-pattern">Custom Pattern</Label>
                        </div>
                      </RadioGroup>
    
                      {renamePattern === "custom" && (
                        <div className="mt-2">
                          <Input
                            placeholder="Pattern: {name}_{n}_{date}"
                            value={customNamePattern}
                            onChange={(e) => setCustomNamePattern(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Available variables: {"{name}"}, {"{n}"}, {"{date}"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Example: If pattern is &quot;photo_{'{n}'}_{'{date}'}&quot; → &quot;photo_001_2024-03-21T15-30-45&quot;
                          </p>
                        </div>
                      )}
                    </div>
    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="watermark-toggle" className="text-sm font-medium">Enable Watermark</Label>
                        <Switch
                          id="watermark-toggle"
                          checked={enableWatermark}
                          onCheckedChange={setEnableWatermark}
                        />
                      </div>
    
                      {enableWatermark && (
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Watermark Type</Label>
                            <RadioGroup
                              value={watermarkType}
                              onValueChange={(value: WatermarkType) => {
                                setWatermarkType(value);
                                // Reset the other type's value when switching
                                if (value === "text") {
                                  setWatermarkLogo(null);
                                } else {
                                  setWatermarkText("");
                                }
                              }}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="text" id="text" />
                                <Label htmlFor="text">Text</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="logo" id="logo" />
                                <Label htmlFor="logo">Logo</Label>
                              </div>
                            </RadioGroup>
                          </div>
    
                          {watermarkType === "text" ? (
                            <div className="space-y-2">
                              <Label htmlFor="watermark-text">Watermark Text</Label>
                              <Input
                                id="watermark-text"
                                placeholder="Enter watermark text"
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label htmlFor="watermark-logo">Watermark Logo</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="watermark-logo"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setWatermarkLogo(e.target.files[0]);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById("watermark-logo")?.click()}
                                >
                                  Choose Logo
                                </Button>
                                {watermarkLogo && (
                                  <span className="text-sm text-muted-foreground">
                                    {watermarkLogo.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
    
                          <div className="space-y-2">
                            <Label htmlFor="watermark-position">Watermark Position</Label>
                            <Select
                              value={watermarkPosition}
                              onValueChange={(value: string) => setWatermarkPosition(value as WatermarkPosition)}
                            >
                              <SelectTrigger id="watermark-position">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="top-left">Top Left</SelectItem>
                                <SelectItem value="top-right">Top Right</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
    
                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-center text-muted-foreground">
                        Processing... {Math.round(progress)}%
                      </p>
                    </div>
                  )}
                  
                  <Button
                    className="w-full"
                    onClick={processImages}
                    disabled={
                      isProcessing || 
                      (enableWatermark && 
                        ((watermarkType === "text" && !watermarkText) || 
                         (watermarkType === "logo" && !watermarkLogo)))
                    }
                  >
                    {isProcessing ? "Processing..." : "Preview Results"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
    
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-4xl bg-white z-[999]">
              <DialogHeader>
                <DialogTitle>Preview Results</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-[15px] overflow-hidden">
                  {previewImages.length > 0 && (
                    <Image
                      src={previewImages[currentPreviewIndex]}
                      alt={`Preview ${currentPreviewIndex + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  
                  {previewImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2"
                        onClick={() => setCurrentPreviewIndex((prev) => 
                          prev > 0 ? prev - 1 : previewImages.length - 1
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setCurrentPreviewIndex((prev) => 
                          prev < previewImages.length - 1 ? prev + 1 : 0
                        )}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
    
                {showThumbnails && previewImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {previewImages.map((preview, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPreviewIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                          index === currentPreviewIndex ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <Image
                          src={preview}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                )}
    
                <div className="text-center text-sm text-muted-foreground">
                  {previewImages.length > 1 && (
                    <p>Image {currentPreviewIndex + 1} of {Math.min(files.length, 5)}</p>
                  )}
                  {files.length > 5 && (
                    <p className="mt-1">Showing first 5 images of {files.length} total</p>
                  )}
                </div>
              </div>
    
              <DialogFooter className="flex justify-between ">
                <div className="flex items-center space-x-2  ">
                  <Button  className=" cursor-pointer lg:mt-0 mt-3" variant="outline" onClick={handleClosePreview}>
                    Cancel
                  </Button>
                  <Button
                   className=" cursor-pointer lg:mt-0 mt-3" 
                    variant="outline"
                    size="icon"
                    onClick={() => setShowThumbnails(!showThumbnails)}
                    title={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
                <Button  className=" cursor-pointer"  onClick={handleDownload}>
                  Download All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    
          {/* <div className="grid gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Image Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageEffects
                  currentRotation={currentImageEffects.rotation}
                  currentFilter={currentImageEffects.filter}
                  currentFilterValue={currentImageEffects.filterValue}
                  onRotate={handleRotate}
                  onFilterChange={handleFilterChange}
                />
              </CardContent>
            </Card>
          </div> */}
        </div>
  )
}

export default Compress;