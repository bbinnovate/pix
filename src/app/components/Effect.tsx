"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageEffects, Filter } from "@/components/ui/image-effects";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight ,Plus, X  } from "lucide-react";
import { Progress } from "@/components/ui/progress";



type ImageMetadata = {
  width: number;
  height: number;
  orientation: number;
  rotation: number;
  filter: Filter;
  filterValue: number;
};
export default function Effects() {
    const [isDragging, setIsDragging] = useState(false);
      const [progress, setProgress] = useState(0);
      const [imageMetadata, setImageMetadata] = useState<ImageMetadata[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
const [previewImages, setPreviewImages] = useState<string[]>([]);
const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
const [showThumbnails] = useState(true);
  const [currentEffects, setCurrentEffects] = useState<{
    rotation: number;
    filter: Filter;
    filterValue: number;
  }>({
    rotation: 0,
    filter: "none",
    filterValue: 50,
  });

const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files) return;

  const selectedFiles = Array.from(e.target.files);

  // store files
  setFiles(selectedFiles);

  // create preview urls immediately
  const previewUrls = selectedFiles.map((file) =>
    URL.createObjectURL(file)
  );

  setPreviewImages(previewUrls);

  // optional metadata
  const metadata = await Promise.all(
    selectedFiles.map((file) => getImageMetadata(file))
  );

  setImageMetadata(metadata);

  // show first image
  setCurrentPreviewIndex(0);
};

const dropHandler = async (e: React.DragEvent) => {
  e.preventDefault();

   setIsDragging(false);

  const droppedFiles = Array.from(e.dataTransfer.files);

  setFiles(droppedFiles);

  const previewUrls = droppedFiles.map((file) =>
    URL.createObjectURL(file)
  );

  setPreviewImages(previewUrls);

  const metadata = await Promise.all(
    droppedFiles.map((file) => getImageMetadata(file))
  );

  setImageMetadata(metadata);

  setCurrentPreviewIndex(0);
};

const dragOverHandler = (
  e: React.DragEvent<HTMLDivElement>
) => {
  e.preventDefault();

  setIsDragging(true);
};

  const dragLeaveHandler = () => {
  setIsDragging(false);
};

  const applyEffects = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;

          // Apply rotation
          if (currentEffects.rotation !== 0) {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((currentEffects.rotation * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
          }

          // Draw image
          ctx.drawImage(img, 0, 0);

          // Apply filters
          if (currentEffects.filter !== "none") {
            const value = currentEffects.filterValue / 100;
            switch (currentEffects.filter) {
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
                ctx.drawImage(img, 0, 0);
                break;
              case "blur":
                ctx.filter = `blur(${value * 10}px)`;
                ctx.drawImage(img, 0, 0);
                break;
              case "brightness":
                ctx.filter = `brightness(${value * 2})`;
                ctx.drawImage(img, 0, 0);
                break;
              case "contrast":
                ctx.filter = `contrast(${value * 2}%)`;
                ctx.drawImage(img, 0, 0);
                break;
            }
          }

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

  const getImageMetadata = (
    file: File
  ): Promise<ImageMetadata> => {
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

const processImages = useCallback(async () => {
  if (files.length === 0) return;

  setIsProcessing(true);
  setProgress(0);

  // cleanup old previews
  previewImages.forEach((url) => URL.revokeObjectURL(url));

  const previews: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const processedBlob = await applyEffects(files[i]);

      const url = URL.createObjectURL(processedBlob);

      previews.push(url);

      setProgress(((i + 1) / files.length) * 100);
    }

    setPreviewImages(previews);
  } catch (error) {
    console.error("Error processing images:", error);
  } finally {
    setIsProcessing(false);
  }
}, [files, currentEffects]);

useEffect(() => {
  if (files.length === 0) return;

  const timeout = setTimeout(() => {
    processImages();
  }, 120);

  return () => clearTimeout(timeout);
}, [files, currentEffects, processImages]);


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
setImageMetadata((prev: ImageMetadata[]) => [
  ...prev,
  ...metadata,
]);

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

const handleDownload = async () => {
  const zip = new JSZip();
  const folder = zip.folder("effects-applied");

  for (let i = 0; i < files.length; i++) {
    const blob = await applyEffects(files[i]);
    folder?.file(files[i].name, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "effects-applied.zip");

  setPreviewOpen(false);
};


const handleClosePreview = () => {
  setPreviewOpen(false);
};

  function clsx(base: string, conditional: string): string {
    return `${base} ${conditional}`.trim();
  }

  return (
  <div className=" container min-h-[calc(100vh-160px)] flex justify-center flex-col px-6 lg:pt-20  pt-0">
<div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row  lg:gap-6 gap-0 ">
 {/* LEFT SIDE - IMAGE PREVIEW */}
<div className="w-full  lg:w-[70%] lg:pt-10  pt-10 ">

<div className="relative w-full min-h-[400px] rounded-[28px] flex items-center justify-center ">
  

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
{previewImages.length > 0 && (
  
<div
  className="
   flex items-center justify-center
    flex-wrap
    gap-3
    lg:mt-6
    mt-3
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
  <div className=" w-full lg:w-[30%] flex lg:mt-0 mt-5  ">
  <div className="bg-white w-full flex min-h-[400px] lg:min-h-[600px] flex-col justify-between self-stretch p-6 space-y-6 shadow-[-10px_0px_30px_rgba(0,0,0,0.04)]">
  
  <div className="space-y-6">
                    <h3> Image Effects</h3>
                  <div className="space-y-6">
                <ImageEffects
                currentRotation={currentEffects.rotation}
                currentFilter={currentEffects.filter}
                currentFilterValue={currentEffects.filterValue}
                onRotate={(degrees) =>
                  setCurrentEffects((prev) => ({ ...prev, rotation: degrees }))
                }
                onFilterChange={(filter, value) =>
                  setCurrentEffects((prev) => ({
                    ...prev,
                    filter,
                    filterValue: value,
                  }))
                }
              />
          
            </div>
    
                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-center text-muted-foreground">
                        Processing... {Math.round(progress)}%
                      </p>
                    </div>
                  )}
                  
                 

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



        <CardContent>
         

         
        </CardContent>



        


      </div>

  );
} 