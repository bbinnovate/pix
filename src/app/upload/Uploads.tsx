"use client";


import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import FetchProductsButton from "@/components/FetchProductsButton";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

// Define interfaces outside the component
interface UploadedFolder {
  folderName: string;
  files: File[];
}

interface FolderMapping {
  imagePosition: string;
  folderName: string;
  productId: string;
  variantName?: string;
}

export default function Upload() {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFolders, setUploadedFolders] = useState<UploadedFolder[]>([]);
  const [folderMappings, setFolderMappings] = useState<FolderMapping[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const [shopifyURL, setShopifyURL] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");

  const [status, setStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const [pageDisabled, setPageDisabled] = useState<boolean>(false);

  useEffect(() => {
    // Clear any stored values in localStorage
    localStorage.removeItem("shopifyURL");
    localStorage.removeItem("apiKey");

    // Handle page refresh or tab/browser close
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isUploading) {
        const message =
          "Image uploading is in progress. Are you sure you want to leave?";
        event.returnValue = message; // Standard for most browsers
        return message; // For some older browsers (e.g., IE)
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup listener when the component is unmounted
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isUploading]);

  // const chartData = [
  //   { month: "January", desktop: 186, mobile: 80 },
  //   { month: "February", desktop: 305, mobile: 200 },
  //   { month: "March", desktop: 237, mobile: 120 },
  //   { month: "April", desktop: 73, mobile: 190 },
  //   { month: "May", desktop: 209, mobile: 130 },
  //   { month: "June", desktop: 214, mobile: 140 },
  // ];

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey, shopifyURL }),
      });

      if (response.ok) {
        setStatus("Connection successful! 🎉");
      } else {
        throw new Error(
          "Failed to connect to Shopify. Please check your credentials."
        );
      }
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const folderName = files[0]?.webkitRelativePath.split("/")[0];
      const fileArray = Array.from(files);
      const existingFolder = uploadedFolders.find(
        (folder) => folder.folderName === folderName
      );

      if (existingFolder) {
        setError("This folder is already uploaded.");
        return;
      }

      setUploadedFolders((prev) => [
        ...prev,
        {
          folderName: folderName || `Folder-${uploadedFolders.length + 1}`,
          files: fileArray,
        },
      ]);
    }
  };

  const handleUploadFiles = async () => {
    if (uploadedFolders.length === 0) {
      setError("Please upload at least one folder.");
      return;
    }

    try {
      setError(null);
      setIsUploading(true);
      setPageDisabled(true); // Disable the page while uploading

      if (!shopifyURL || !apiKey) {
        setError("Please provide your Shopify URL and API key.");
        return;
      }

      const folderNames = uploadedFolders.map((folder) => folder.folderName);

      const response = await fetch("/api/get-product-ids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopifyURL,
          apiKey,
          folderNames,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product IDs.");
      }

      const data: FolderMapping[] = await response.json();
      setFolderMappings(data);

      let uploadedCount = 0;
      const totalFiles = uploadedFolders.reduce(
        (acc, folder) => acc + folder.files.length,
        0
      );

      for (const folder of uploadedFolders) {
        const normalizedFolderName = normalizeFolderName(folder.folderName);

        const mapping = folderMappings.find(
          (m) => normalizeFolderName(m.folderName) === normalizedFolderName
        );

        if (!mapping) {
          console.warn(`No product ID found for folder: ${folder.folderName}`);
          continue;
        }

        for (const file of folder.files) {
          const filename = file.name;
          const baseFilename = filename.split(".")[0];

          let imagePosition = "";
          let variantName = "";

          if (/^\d/.test(baseFilename)) {
            imagePosition = baseFilename;
          } else if (/^[a-zA-Z]/.test(baseFilename)) {
            variantName = baseFilename.toLowerCase();
          }

          if (file.type.startsWith("image/")) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("productId", mapping.productId.toString());
            formData.append("imagePosition", imagePosition || "");
            formData.append("variantName", variantName || "");
            formData.append("shopifyURL", shopifyURL);
            formData.append("apiKey", apiKey);

            await uploadFileWithDelay(formData, file);
            uploadedCount++;
            setProgress((uploadedCount / totalFiles) * 100);
          } else {
            console.log(`Skipping non-image file: ${file.name}`);
          }
        }
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsUploading(false);
      setPageDisabled(false); // Enable the page after the upload process is complete
    }
  };

  const normalizeFolderName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
  };

  const uploadFileWithDelay = async (formData: FormData, file: File) => {
    const worker = new Worker(
      new URL("./imageProcessor.worker.ts", import.meta.url)
    );

    const processedFile = await new Promise<Blob>((resolve, reject) => {
      worker.onmessage = (event) => {
        const { file } = event.data;
        resolve(file);
      };

      worker.onerror = (error) => {
        reject(error);
      };

      worker.postMessage({ file });
    });

    worker.terminate();

    const processedFormData = new FormData();
    processedFormData.append("file", processedFile);
    processedFormData.append("productId", formData.get("productId") as string);
    processedFormData.append(
      "imagePosition",
      formData.get("imagePosition") as string
    );
    processedFormData.append(
      "variantName",
      formData.get("variantName") as string
    );
    processedFormData.append(
      "shopifyURL",
      formData.get("shopifyURL") as string
    );
    processedFormData.append("apiKey", formData.get("apiKey") as string);

    const response = await fetch("/api/upload-file", {
      method: "POST",
      body: processedFormData,
    });

    if (!response.ok) {
      console.error(`Failed to upload file: ${file.name}`);
    } else {
      console.log(`Uploaded file: ${file.name}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 550));
  };

  const handleRemoveFolder = (folderName: string) => {
    setUploadedFolders((prev) =>
      prev.filter((folder) => folder.folderName !== folderName)
    );
  };

  return (
    <div className=" container grid place-content-center grid-cols-1 sm:grid-cols-2 gap-8 p-8">
      {/* How to Name Your Files Section */}
      <motion.section
        className="w-full max-w-4xl text-center sm:text-left flex items-center flex-col justify-center mt-8 sm:mt-12"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full bg-muted p-6 rounded">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-semibold text-primary">
              How to Name Your Files 📝
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="">
              Name your files based on the variant and position of the image. If
              you have multiple variants (e.g., color and size), follow these
              guidelines:
            </p>

            <ul className="list-disc pl-6 ">
              <li>
                For image position name your file like &quot;1.jpg&quot;, &quot;2.jpg&quot;,
                etc., depending on which image position you want.
              </li>
              <li>
                For color and size variants:
                <ul className="list-inside list-disc">
                  <li>
                    If you want the same image to apply to all sizes of a
                    specific color (e.g., &quot;Red&quot;), you can name your file like
                    &quot;Red.jpg&quot;. This will upload to all variants, like &quot;Red/XS&quot;,
                    &quot;Red/S&quot;, etc.
                  </li>
                  <li>
                    If you want to upload to a specific color and size variant,
                    name your file like &quot;Green/M.jpg&quot; for a Green T-shirt in
                    Medium size.
                  </li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.section>
      <div
        className={`grid place-content-center items-center justify-items-center min-h-screen p-8 gap-16 ${
          pageDisabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <Card className="w-full max-w-lg p-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-semibold mb-4">
              Upload Image Files 📤
            </CardTitle>
            <CardDescription className="text-center text-sm mb-4">
              Upload your image files from folders to sync with Shopify.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Shopify URL and API Key Input Fields */}
              <div>
                <TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Label
                          htmlFor="shopifyURL"
                          className="text-lg font-semibold"
                        >
                          Shopify Website URL 🌐
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        Enter the full URL of your Shopify store
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TooltipProvider>

                <Input
                  type="text"
                  id="shopifyURL"
                  value={shopifyURL}
                  onChange={(e) => setShopifyURL(e.target.value)}
                  className="mt-2"
                  placeholder="Enter your Shopify store URL"
                  disabled={pageDisabled}
                  autoComplete="on"
                />
              </div>

              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Label htmlFor="apiKey" className="text-lg font-semibold">
                        Shopify API Key 🔑
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>Enter your Shopify API key</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-2"
                  placeholder="Enter your Shopify API key"
                  disabled={pageDisabled}
                  autoComplete="on"
                />
              </div>

              <div className="flex flex-col items-center mt-4">
                <Button
                  onClick={handleTestConnection}
                  className=""
                  disabled={isTesting}
                >
                  {isTesting ? "Testing..." : "Test Connection"}
                </Button>
                {status && (
                  <p
                    className={`mt-2 ${
                      status.includes("successful")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {status}
                  </p>
                )}
              </div>

              {/* Folder Upload Input */}
              {apiKey &&
                shopifyURL &&
                status &&
                status.includes("successful") && (
                  <>
                    <h1>Create all folders on your device</h1>
                    <FetchProductsButton
                      apiKey={apiKey}
                      storeLink={shopifyURL}
                    />
                  </>
                )}

              {status && status.includes("successful") && (
                <div>
                  <Label
                    htmlFor="imageFolder"
                    className="text-lg font-semibold"
                  >
                    Upload Image Folders 📂
                  </Label>
                  <Input
                    type="file"
                    id="imageFolder"
                    ref={(input) => {
                      if (input) {
                        input.setAttribute("webkitdirectory", "");
                        input.setAttribute("directory", "");
                      }
                    }}
                    multiple
                    onChange={handleFolderChange}
                    className="mt-2"
                    disabled={pageDisabled}
                  />
                </div>
              )}

              {uploadedFolders.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">
                    Uploaded Folders:
                  </h2>
                  <ul className="space-y-2">
                    {uploadedFolders.map((folder) => (
                      <li
                        key={folder.folderName}
                        className="flex items-center justify-between bg-gray-100 p-3 rounded shadow"
                      >
                        <span>
                          {folder.folderName} ({folder.files.length} files)
                        </span>
                        <Button
                          onClick={() => handleRemoveFolder(folder.folderName)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          disabled={pageDisabled}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && <p className="text-red-600 text-center">{error}</p>}

              {isUploading && (
                <div className="mt-4">
                  <Progress value={progress} className="mt-2" />
                  <p className="text-center mt-2">
                    {progress.toFixed(2)}% completed
                  </p>
                </div>
              )}

              {status && status.includes("successful") && (
                <Button
                  onClick={handleUploadFiles}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
                  disabled={isUploading || pageDisabled}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Start Uploading Files"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
