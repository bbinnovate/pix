"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
  const [options, setOptions] = useState<ConversionOptions>({
    format: "png",
    quality: 0.8,
    dpi: 300,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const pdfFiles = Array.from(e.target.files).filter(file => 
        file.type === "application/pdf"
      );
      setFiles(pdfFiles);
    }
  };

  const dropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type === "application/pdf"
      );
      setFiles(pdfFiles);
    }
  };

  const dragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const convertPdfToImages = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    const zip = new JSZip();
    const folder = zip.folder("pdf-images");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const arrayBuffer = await file.arrayBuffer();
          
          const pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
            cMapPacked: true
          }).promise;
          
          for (let j = 1; j <= pdf.numPages; j++) {
            const page = await pdf.getPage(j);
            const viewport = page.getViewport({ scale: options.dpi / 72 });
            
            // Create a canvas with the appropriate size
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            const ctx = canvas.getContext("2d")!;
            
            // Render the page to canvas
            await page.render({
              canvasContext: ctx,
              viewport: viewport,
            }).promise;
            
            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error("Failed to create blob from canvas"));
                  }
                },
                `image/${options.format}`,
                options.quality
              );
            });
            
            // Add to zip with page number
            const fileName = `${file.name.replace(".pdf", "")}_page${j}.${options.format}`;
            folder?.file(fileName, blob);
          }
        } catch (error) {
          throw new Error(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        setProgress(((i + 1) / files.length) * 100);
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "pdf-images.zip");
    } catch (error) {
      alert(`Error converting PDFs: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
     <div className="min-h-[calc(100vh-160px)] flex justify-center px-6 lg:pt-40  pt-0">
       <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            PDF to Image Converter
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
              accept=".pdf"
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
            or drag and drop your PDF files here
            {files.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {files.length} PDF file(s) selected
              </p>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-6">
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

              <Button
                className="w-full"
                onClick={convertPdfToImages}
                disabled={isProcessing}
              >
                {isProcessing ? `Converting... ${Math.round(progress)}%` : "Convert to Images"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Note: Each page of the PDF will be converted to a separate image file.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 