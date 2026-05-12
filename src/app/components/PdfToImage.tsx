"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight ,Plus, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";



// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ConversionOptions {
  format: "png" | "jpeg";
  quality: number;
  dpi: number;
}

export default function PdfToImage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
const [previewImages, setPreviewImages] = useState<string[]>([]);
const [isScanning, setIsScanning] = useState(false);
const [convertedPages, setConvertedPages] = useState<
  {
    url: string;
    fileName: string;
    blob: Blob;
  }[]
>([]);
const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
const [showThumbnails] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    format: "png",
    quality: 0.8,
    dpi: 300,
  });

  


  useEffect(() => {
  if (files.length === 0) return;

  convertPdfToImages();
}, [files]);

 const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files) return;

  const pdfFiles = Array.from(e.target.files).filter(
    (file) => file.type === "application/pdf"
  );

  setFiles(pdfFiles);

  // clear old previews
  setPreviewImages([]);

  setCurrentPreviewIndex(0);
};

const dropHandler = async (e: React.DragEvent) => {
  e.preventDefault();

   setIsDragging(false);

  if (!e.dataTransfer.files) return;

  const droppedFiles = Array.from(e.dataTransfer.files);



  setFiles(droppedFiles);


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

const convertPdfToImages = async () => {
  if (files.length === 0) return;

  setIsProcessing(true);
  setProgress(0);

  const previews: string[] = [];

  const pages: {
    url: string;
    fileName: string;
    blob: Blob;
  }[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      for (let j = 1; j <= pdf.numPages; j++) {
        const page = await pdf.getPage(j);

        const viewport = page.getViewport({
          scale: options.dpi / 72,
        });

        const canvas = document.createElement("canvas");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d")!;

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b as Blob),
            `image/${options.format}`,
            options.quality
          );
        });

        const url = URL.createObjectURL(blob);

        const originalName = file.name.replace(".pdf", "");

        const fileName =
          pdf.numPages > 1
            ? `${originalName}_page${j}.${options.format}`
            : `${originalName}.${options.format}`;

        previews.push(url);

        pages.push({
          url,
          fileName,
          blob,
        });
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    setPreviewImages(previews);
    setConvertedPages(pages);
  } catch (error) {
    console.error(error);
  } finally {
    setIsProcessing(false);
    setProgress(0);
  }
};




const handleDownload = async () => {
  try {
    setIsScanning(true);

    // fake scanning delay
    await new Promise((resolve) =>
      setTimeout(resolve, 3000)
    );

    for (const page of convertedPages) {
      saveAs(page.blob, page.fileName);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsScanning(false);
  }
};


const handleClosePreview = () => {
  setPreviewOpen(false);
};

const handleAddMoreImages = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files) return;

  const newFiles = Array.from(e.target.files);


  // append files
  setFiles((prev) => [...prev, ...newFiles]);



  setPreviewImages((prev) => [
    ...prev,
  ]);

  // reset input
  e.target.value = "";
};


const removeImage = (indexToRemove: number) => {
  URL.revokeObjectURL(
    convertedPages[indexToRemove]?.url
  );

  const updatedPages = convertedPages.filter(
    (_, index) => index !== indexToRemove
  );

  setConvertedPages(updatedPages);

  setPreviewImages(
    updatedPages.map((page) => page.url)
  );

  if (updatedPages.length === 0) {
    setCurrentPreviewIndex(0);
    return;
  }

  if (currentPreviewIndex >= updatedPages.length) {
    setCurrentPreviewIndex(
      updatedPages.length - 1
    );
  }
};
  function clsx(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
  }

  return (
           <div className=" container min-h-[calc(100vh-160px)] flex justify-center flex-col px-6 lg:pt-20  pt-0">
<div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-stretch lg:gap-6 gap-0">
   


   {/* LEFT SIDE - IMAGE PREVIEW */}
                <div className="w-full  lg:w-[70%] lg:pt-10  pt-10 ">
   
   <div className="relative w-full min-h-[400px] rounded-[28px] flex items-center justify-center ">
     
   
           {/* IMAGE */}
           {previewImages.length > 0 ? (
  <div className="relative">
    <Image
      src={previewImages[currentPreviewIndex]}
      alt="Preview"
      width={700}
      height={700}
      className="object-contain lg:mt-0 mt-20 max-h-[450px] w-auto h-auto border-2 border-black rounded-[20px] shadow-lg p-2 bg-white"
      unoptimized
    />

    {/* SCANNING OVERLAY */}
   {isScanning && (
  <div className="absolute inset-0 rounded-[20px] overflow-hidden z-30">

    {/* DARK GLASS OVERLAY */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />

    {/* CINEMATIC REFLECTION */}
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)]" />

    {/* SCAN AREA */}
    <div className="absolute inset-0 overflow-hidden">

      {/* MAIN SCAN LINE */}
      <div className="scan-line absolute left-0 right-0 h-[120px]" />

      {/* GLOW */}
      <div className="scan-glow absolute left-0 right-0 h-[220px]" />

    </div>

    {/* CENTER CONTENT */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 px-6 py-3 rounded-2xl border border-white/10">
            <p className="text-white text-sm font-medium tracking-wide">
              Scanning & Preparing Download...
            </p>
          </div>
        </div>
   
    </div>
  </div>
)}
  </div>
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
       accept=".pdf"
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
        accept=".pdf"
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
  <div className="bg-white w-full flex min-h-[480px] lg:min-h-[630px] flex-col justify-between self-stretch p-6 space-y-6 shadow-[-10px_0px_30px_rgba(0,0,0,0.04)]">
  
   

            <div className="space-y-6">
                <h3> PDF to Image Converter</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <div className="flex space-x-4">
                    <Button
                      variant={options.format === "jpeg" ? "default" : "outline"}
                      onClick={() => setOptions(prev => ({ ...prev, format: "jpeg" }))}
                    >
                      JPEG
                    </Button>
                    <Button
                      variant={options.format === "png" ? "default" : "outline"}
                      onClick={() => setOptions(prev => ({ ...prev, format: "png" }))}
                    >
                      PNG
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quality ({Math.round(options.quality * 100)}%)</Label>
                  <Slider
                    value={[options.quality]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={([value]) =>
                      setOptions(prev => ({ ...prev, quality: value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>DPI (Resolution)</Label>
                  <div className="flex space-x-4">
                    {[72, 150, 300, 600].map(dpi => (
                      <Button
                        key={dpi}
                        variant={options.dpi === dpi ? "default" : "outline"}
                        onClick={() => setOptions(prev => ({ ...prev, dpi }))}
                      >
                        {dpi}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

             

              <p className="text-sm text-muted-foreground text-center">
                Note: Each page of the PDF will be converted to a separate image file.
              </p>
            
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
                {isProcessing ? `Converting... ${Math.round(progress)}%` : "Convert to Images"}
              </Button>
            </div>
            </div>

       </div>
    </div>


       
      </div>
    </div>
  );
} 