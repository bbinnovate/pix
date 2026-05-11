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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAs } from "file-saver";
import { ChevronLeft, ChevronRight, ChevronDown, Plus, X } from "lucide-react";
import {  Filter } from "@/components/ui/image-effects";
import Image from "next/image";
import { clsx } from 'clsx';


type CompressionLevel = "1x" | "2x" | "3x" | "4x" | "custom";
type WatermarkPosition =
  | "all"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";
  

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
const compressionOptions = [
  {
    value: "1x",
    label: "1x (Light) - 1920px, 80% quality",
  },
  {
    value: "2x",
    label: "2x (Medium) - 1440px, 70% quality",
  },
  {
    value: "3x",
    label: "3x (High) - 1080px, 60% quality",
  },
  {
    value: "4x",
    label: "4x (Maximum) - 800px, 50% quality",
  },
  {
    value: "custom",
    label: "Custom Settings",
  },
];


const watermarkOptions = [
  { value: "all", label: "All Positions" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];
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
      const [watermarkOpacity, setWatermarkOpacity] = useState(50);
      const [watermarkWidth, setWatermarkWidth] = useState(15);
      const [previewImages, setPreviewImages] = useState<string[]>([]);
      const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
      const [processedBlobs, setProcessedBlobs] = useState<Blob[]>([]);
      const [isDragging, setIsDragging] = useState(false);
      const [isCompressionOpen, setIsCompressionOpen] = useState(false);
      const [customQuality, setCustomQuality] = useState(80);
      const [customMaxSize, setCustomMaxSize] = useState(1920);
      const [renamePattern, setRenamePattern] = useState<RenamePattern>("original");
      const [customNamePattern, setCustomNamePattern] = useState("");
      const [imageMetadata, setImageMetadata] = useState<ImageMetadata[]>([]);
      const [showThumbnails, setShowThumbnails] = useState(true);
      const [isWatermarkDropdownOpen, setIsWatermarkDropdownOpen] =
  useState(false);
      const [currentImageEffects, setCurrentImageEffects] = useState<{
        rotation: number;
        filter: Filter;
        filterValue: number;
      }>({
        rotation: 0,
        filter: "none",
        filterValue: 50,
      });
    

 
    
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
          case "custom": {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-GB")
    .replace(/\//g, "-"); // 12-05-2026

  const cleanName = customNamePattern.trim() || "image";

  return `${cleanName}_${formattedDate}.${ext}`;
}
          default:
            return originalName;
        }
      };


      const getWatermarkPositions = (
  canvas: HTMLCanvasElement,
  itemWidth: number,
  itemHeight: number
) => {
  const padding = 20;

  return {
    "top-left": {
      x: padding,
      y: padding,
    },

    // "top-center": {
    //   x: (canvas.width - itemWidth) / 2,
    //   y: padding,
    // },

    "top-right": {
      x: canvas.width - itemWidth - padding,
      y: padding,
    },

    // "center-left": {
    //   x: padding,
    //   y: (canvas.height - itemHeight) / 2,
    // },

    center: {
      x: (canvas.width - itemWidth) / 2,
      y: (canvas.height - itemHeight) / 2,
    },

    // "center-right": {
    //   x: canvas.width - itemWidth - padding,
    //   y: (canvas.height - itemHeight) / 2,
    // },

    "bottom-left": {
      x: padding,
      y: canvas.height - itemHeight - padding,
    },

    // "bottom-center": {
    //   x: (canvas.width - itemWidth) / 2,
    //   y: canvas.height - itemHeight - padding,
    // },

    "bottom-right": {
      x: canvas.width - itemWidth - padding,
      y: canvas.height - itemHeight - padding,
    },
  };
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
              const maxSize =
  Math.min(canvas.width, canvas.height) *
  (watermarkWidth / 100);
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
    
    
    
           ctx.globalAlpha = watermarkOpacity / 100;


const positions = getWatermarkPositions(
  canvas,
  logoWidth,
  logoHeight
);

if (position === "all") {
  Object.values(positions).forEach((pos) => {
    ctx.drawImage(
      img,
      pos.x,
      pos.y,
      logoWidth,
      logoHeight
    );
  });
} else {
  const pos = positions[position];

  if (pos) {
    ctx.drawImage(
      img,
      pos.x,
      pos.y,
      logoWidth,
      logoHeight
    );
  }
}




    
              // Draw logo with slight transparency
              ctx.globalAlpha = watermarkOpacity / 100;
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
        const fontSize =
  Math.min(canvas.width, canvas.height) *
  (watermarkWidth / 100) *
  0.3;

ctx.font = `bold ${fontSize}px Arial`;

ctx.fillStyle = `rgba(255,255,255,${
  watermarkOpacity / 100
})`;

ctx.strokeStyle = `rgba(0,0,0,${
  watermarkOpacity / 100
})`;
        ctx.lineWidth = 2;
        
        // Calculate text metrics
        const metrics = ctx.measureText(text);
       const positions = getWatermarkPositions(
  canvas,
  metrics.width,
  fontSize
);

const drawText = (x: number, y: number) => {
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
};

if (position === "all") {
  Object.values(positions).forEach((pos) => {
    drawText(pos.x, pos.y + fontSize);
  });
} else {
  const pos = positions[position];

  if (pos) {
    drawText(pos.x, pos.y + fontSize);
  }
}
        
       
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
    
      const processImages = useCallback(async (isRotation = false) => {
        if (files.length === 0) return;
    
        setIsProcessing(true);
        setProgress(0);
        
        // Revoke old objects to prevent memory leaks
        previewImages.forEach(URL.revokeObjectURL);
        
        const processed: Blob[] = [];
        const previews: string[] = [];
    
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const compressedBlob = await compressImage(file);
          processed.push(compressedBlob);
          
          // Create preview URLs for the first 5 images
          const previewUrl = URL.createObjectURL(compressedBlob);
previews.push(previewUrl);
          
          setProgress(((i + 1) / files.length) * 100);
        }
    
        setProcessedBlobs(processed);
        setPreviewImages(previews);
        if (!isRotation) {
          setCurrentPreviewIndex(0);
     
        }
        setIsProcessing(false);
      }, [files, compressionLevel, customQuality, customMaxSize, renamePattern, customNamePattern, imageMetadata, enableWatermark, watermarkType, watermarkText, watermarkLogo, watermarkPosition, currentImageEffects, previewImages]);
    
   const handleDownload = async () => {
  try {
    if (!processedBlobs || processedBlobs.length === 0) {
      alert("No processed images found. Click Preview first.");
      return;
    }

    processedBlobs.forEach((blob, index) => {
      if (!blob) return;

      const fileName = generateFileName(
  (files[index]?.name || `image_${index}.jpg`).replace(/\s+/g, "_"),
  index
);

      saveAs(blob, fileName);
    });

  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    alert("Download failed. Check console.");
  }
};
     const dragOverHandler = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setIsDragging(true);
};

const dragLeaveHandler = () => {
  setIsDragging(false);
};

const dropHandler = async (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setIsDragging(false);

  const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
    file.type.startsWith("image/")
  );

  if (droppedFiles.length > 0) {
    setFiles(droppedFiles);

    // generate metadata
    const metadata = await Promise.all(
      droppedFiles.map((file) => getImageMetadata(file))
    );

    setImageMetadata(metadata);
  }
};

      const handleRotate = useCallback(() => {
        setCurrentImageEffects(prev => {
          const newRotation = (prev.rotation + 90) % 360;
          return { ...prev, rotation: newRotation };
        });
      }, []);

      // Re-process images when effects change if preview is open
useEffect(() => {
  if (files.length === 0) return;

  const timeout = setTimeout(() => {
    processImages(true);
  }, 150);

  return () => clearTimeout(timeout);
}, [
  files,
  currentImageEffects,
  compressionLevel,
  watermarkText,
  enableWatermark,
  watermarkPosition,
  watermarkOpacity,
  watermarkWidth,
  customQuality,
  customMaxSize,
]);


     const removeImage = (indexToRemove: number) => {
  const updatedPreviews = previewImages.filter(
    (_, index) => index !== indexToRemove
  );

  const updatedFiles = files.filter(
    (_, index) => index !== indexToRemove
  );

  setPreviewImages(updatedPreviews);
  setFiles(updatedFiles);

  if (currentPreviewIndex >= updatedPreviews.length) {
    setCurrentPreviewIndex(
      Math.max(updatedPreviews.length - 1, 0)
    );
  }
};


const handleAddMoreImages = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files) return;

  const newFiles = Array.from(e.target.files);

  const metadata = await Promise.all(
    newFiles.map((file) => getImageMetadata(file))
  );

  // append files
  setFiles((prev) => [...prev, ...newFiles]);

  // append metadata
  setImageMetadata((prev) => [...prev, ...metadata]);

  // append preview urls
  const newPreviewUrls = newFiles.map((file) =>
    URL.createObjectURL(file)
  );

  setPreviewImages((prev) => [
    ...prev,
    ...newPreviewUrls,
  ]);

  // reset input
  e.target.value = "";
};
  return (
  <div className=" container min-h-[calc(100vh-160px)] flex justify-center flex-col px-6 lg:pt-20  pt-0">

 
<div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row  lg:gap-6 gap-0 ">
    
    {/* LEFT SIDE - IMAGE PREVIEW */}
    <div className="w-full  lg:w-[70%] lg:pt-10  pt-0 ">

<div className="relative w-full min-h-[400px] rounded-[28px] flex items-center justify-center overflow-hidden">{/* {isProcessing && (
  <div className="absolute  inset-0 z-20  backdrop-blur-sm flex items-center justify-center">
    
    <div className="flex flex-col items-center gap-4">
      
      <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />

      <p className="text-white text-sm font-medium tracking-wide animate-pulse">
        Updating Preview...
      </p>

    </div>
  </div>
)} */}
        {/* IMAGE */}
        {previewImages.length > 0 ? (
         <Image
  src={previewImages[currentPreviewIndex]}
  alt="Preview"
  width={700}
  height={700}
  className="object-contain  lg:mt-0 mt-20 max-h-[450px] w-auto h-auto border-2   border-black rounded-[20px] shadow-lg p-2 bg-white"
  unoptimized
/>
        ) : (
            <div
  className={`container border-2 border-dashed rounded-[24px]
  lg:h-[370px] h-[220px]
  lg:mt-0 mt-20
  px-6 py-8
  text-center
  flex flex-col items-center justify-center
  gap-3
  mb-4
  transition-all duration-300 ${
    isDragging
      ? "bg-yellow-50 border-yellow-300"
      : "bg-background border-border"
  }`}
  onDrop={dropHandler}
  onDragOver={dragOverHandler}
  onDragLeave={dragLeaveHandler}
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
    className="
      cursor-pointer
      bg-black
      text-white
      px-5 py-3
      rounded-xl
      text-sm lg:text-base
      font-medium
      transition-all
      hover:scale-[1.03]
      hover:bg-[#222]
    "
  >
    Click to Upload
  </label>

  <p className="text-sm lg:text-base text-muted-foreground max-w-[280px] leading-relaxed">
    or drag and drop your images here
  </p>

  {files.length > 0 && (
    <p className="text-sm text-muted-foreground">
      {files.length} file(s) selected
    </p>
  )}
</div>
        )}

        {/* NAVIGATION */}
        {previewImages.length > 1 && (
          <>

        
            <button
              onClick={() =>
                setCurrentPreviewIndex((prev) =>
                  prev > 0 ? prev - 1 : previewImages.length - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 lg:mt-0 mt-10  bg-black backdrop-blur-md text-white lg:p-3 p-1 rounded-full"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() =>
                setCurrentPreviewIndex((prev) =>
                  prev < previewImages.length - 1 ? prev + 1 : 0
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 lg:mt-0 mt-10 bg-black backdrop-blur-md text-white lg:p-3 p-1 rounded-full"
            >
              <ChevronRight />
            </button>
           
          </>
        )}
      </div>

      {/* THUMBNAILS */}
      {/* THUMBNAILS */}
{previewImages.length > 0 && (
  
  <div
  className="
    grid
    grid-cols-3
    sm:grid-cols-4
    md:grid-cols-5
    lg:grid-cols-6
    gap-1
    lg:mt-6 mt-3
    pb-2
  "
>
    {previewImages.map((preview, index) => (
      <div
        key={index}
        className={clsx(
          "relative w-24 h-24 rounded-[22px] overflow-hidden border-2 flex-shrink-0 transition-all duration-200",
          index === currentPreviewIndex
            ? "border-yellow-400 "
            : "border-transparent"
        )}
      >
        {/* REMOVE BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeImage(index);
          }}
          className="absolute top-1 right-2 z-20 w-5 h-5 rounded-full bg-black hover:bg-[#fab31e] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
        >
          <X size={14} />
        </button>

        {/* IMAGE */}
        <button
          type="button"
          onClick={() => setCurrentPreviewIndex(index)}
          className="relative w-full h-full"
        >
          <Image
            src={preview}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </button>
      </div>
    ))}

    {/* ADD MORE */}
   <>
  <input
    type="file"
    multiple
    accept="image/*"
    id="add-more-images"
    className="hidden"
    onChange={handleAddMoreImages}
  />

  <label
    htmlFor="add-more-images"
    className="w-24 h-24 rounded-[22px] bg-[#151217] flex items-center justify-center flex-shrink-0 cursor-pointer transition-all "
  >
    <Plus className="text-white" size={26} />
  </label>
</>
  </div>
)}
    </div>

    {/* RIGHT SIDE - EDIT PANEL */}
    <div className="w-full lg:w-[30%] relative">
<div className="bg-white h-[70%] min-h-[805px]  p-6 pb-40 space-y-6 shadow-[-10px_0px_30px_rgba(0,0,0,0.04)]">                <div className="space-y-6">
                  <div className="space-y-6 lg:pt-10  pt-0">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="compression-level">Compression Level</Label>
                      <div className="relative isolate">
  <button
    type="button"
    onClick={() => setIsCompressionOpen((prev) => !prev)}
    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all hover:border-gray-400 focus:outline-none"
  >
    <span>
      {
        compressionOptions.find(
          (item) => item.value === compressionLevel
        )?.label
      }
    </span>

    <ChevronDown
      className={`h-4 w-4 transition-transform duration-200 ${
        isCompressionOpen ? "rotate-180" : ""
      }`}
    />
  </button>

  {isCompressionOpen && (
<div className="absolute left-0 top-[calc(100%+8px)] z-[99999] w-full rounded-xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">      <div className="max-h-[260px] overflow-y-auto p-1">
        {compressionOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setCompressionLevel(
                option.value as CompressionLevel
              );
              setIsCompressionOpen(false);
            }}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-all ${
              compressionLevel === option.value
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
    
                    </div>
                      {compressionLevel === "custom" && (
                        <div className="space-y-4 mt-40">
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
  placeholder="Enter file name"
  value={customNamePattern}
  onChange={(e) => setCustomNamePattern(e.target.value)}
/>

<p className="text-sm text-muted-foreground mt-1">
  Example: vacation → vacation_12-05-2026.jpg
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


                           <div className="space-y-4">

  {/* WIDTH */}
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>Watermark Width</Label>
      <span className="text-sm text-muted-foreground">
        {watermarkWidth}%
      </span>
    </div>

    <Slider
      value={[watermarkWidth]}
      onValueChange={(value) => setWatermarkWidth(value[0])}
      min={5}
      max={50}
      step={1}
    />
  </div>

  {/* OPACITY */}
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>Opacity</Label>
      <span className="text-sm text-muted-foreground">
        {watermarkOpacity}%
      </span>
    </div>

    <Slider
      value={[watermarkOpacity]}
      onValueChange={(value) => setWatermarkOpacity(value[0])}
      min={5}
      max={100}
      step={1}
    />
  </div>

</div>
    
                          <div className="space-y-2">
                            <Label htmlFor="watermark-position">Watermark Position</Label>
                            <div className="relative">
  <button
    type="button"
    onClick={() =>
      setIsWatermarkDropdownOpen((prev) => !prev)
    }
    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all hover:border-gray-400 focus:outline-none"
  >
    <span>
      {
        watermarkOptions.find(
          (item) => item.value === watermarkPosition
        )?.label
      }
    </span>

    <ChevronDown
      className={`h-4 w-4 transition-transform duration-200 ${
        isWatermarkDropdownOpen ? "rotate-180" : ""
      }`}
    />
  </button>

  {isWatermarkDropdownOpen && (
    <div className="absolute left-0 top-full z-[9999] mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-2xl">
      <div className="p-1">
        {watermarkOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setWatermarkPosition(
                option.value as WatermarkPosition
              );
              setIsWatermarkDropdownOpen(false);
            }}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-all ${
              watermarkPosition === option.value
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
                  
                  {/* <Button
                    className="w-full"
                    onClick={() => processImages()}
                    disabled={
                      isProcessing || 
                      (enableWatermark && 
                        ((watermarkType === "text" && !watermarkText) || 
                         (watermarkType === "logo" && !watermarkLogo)))
                    }
                  >
                    {isProcessing ? "Processing..." : "Preview Results"}
                  </Button> */}


                     {/* DOWNLOAD BUTTON */}
       <div className="fixed bottom-0 right-0 w-full lg:w-[30%] p-6 bg-white border-t z-50">
  <Button
    onClick={handleDownload}
    className="w-full h-[64px] text-lg font-semibold rounded-2xl"
  >
    Download All Images
  </Button>
</div>
                </div>
             


     
      </div>
    </div>
  </div>

        </div>
  )
}

export default Compress;

// function handleFiles(files: FileList): File[] {
//   return Array.from(files).filter(file => file.type.startsWith('image/'));
// }
