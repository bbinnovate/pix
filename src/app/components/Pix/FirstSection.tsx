"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";


import { MenuIcon, XCircleIcon, ImageIcon, Crop, SlidersHorizontal, FileText, Info } from "lucide-react";

export default function FirstSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const features = [
    {
      title: "Image Compression",
      description: "Compress multiple images with customizable quality and size settings.",
      icon: <ImageIcon className="w-12 h-12 text-primary" />,
      href: "/compress",
    },
    {
      title: "Image Effects",
      description: "Apply filters, adjust brightness, contrast, and more to your images.",
      icon: <SlidersHorizontal className="w-12 h-12 text-primary" />,
      href: "/effects",
    },
    {
      title: "Image Resizer",
      description: "Resize single or multiple images while maintaining aspect ratio.",
      icon: <Crop className="w-12 h-12 text-primary" />,
      href: "/resize",
    },
    {
      title: "PDF to Image",
      description: "Convert PDF files to high-quality images with customizable settings.",
      icon: <FileText className="w-12 h-12 text-primary" />,
      href: "/pdf-to-image",
    },
    {
      title: "Metadata Editor",
      description: "View and strip EXIF metadata from your images with fine-grained control.",
      icon: <Info className="w-12 h-12 text-primary" />,
      href: "/metadata",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:mt-0 -mt-20">
      {/* Navbar */}


      {/* Main content */}
      <div className="flex-grow grid place-content-center items-center justify-items-center p-8 pb-20 gap-8 sm:p-12 md:p-16 lg:p-20">
        <>
          {/* Hero Section */}
          <motion.section
            className="w-full max-w-4xl text-center sm:text-left flex items-center flex-col justify-center mt-8 sm:mt-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-primary">
              Welcome to Pix 🚀
            </h2>
            <p className="text-sm sm:text-base mb-4 max-w-2xl text-center text-muted-foreground">
              Effortlessly upload and match your product images to Shopify SKUs
              in bulk. Let Pix streamline your upload process with powerful image tools.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/upload" passHref>
                <Button className="min-w-[150px]">Start Uploading</Button>
              </Link>
              <Link href="/compress" passHref>
                <Button variant="outline" className="flex items-center gap-2 min-w-[150px]">
                  <span>Compress Images</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                </Button>
              </Link>
            </div>
          </motion.section>

          {/* How to Name Your Files Section */}
          <motion.section
            className="w-full max-w-4xl text-center sm:text-left mt-8 sm:mt-12"
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
                <p className="text-muted-foreground">
                  Name your files based on the variant and position of the
                  image. If you have multiple variants (e.g., color and size),
                  follow these guidelines:
                </p>

                <ul className="list-disc pl-6 mt-4 space-y-4">
                  <li className="text-muted-foreground">
                    For image position name your file like &quot;1.jpg&quot;, &quot;2.jpg&quot;,
                    etc., depending on which image position you want.
                  </li>
                  <li className="text-muted-foreground">
                    For color and size variants:
                    <ul className="list-inside list-disc mt-2 space-y-2">
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

          {/* Why Choose Pix Section */}
          <motion.section
            className="w-full max-w-4xl text-center sm:text-left mt-8 sm:mt-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl font-semibold text-primary text-center">
                  Why Choose Pix? 🤔
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-4xl">⏱️</span>
                    <h4 className="text-xl sm:text-2xl font-semibold mt-2 text-primary">
                      Save Time
                    </h4>
                    <p className="text-sm sm:text-base text-center text-muted-foreground">
                      Upload all your product images in one go, matching them to
                      the right SKUs automatically.
                    </p>
                  </motion.div>
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-4xl">🤖</span>
                    <h4 className="text-xl sm:text-2xl font-semibold mt-2 text-primary">
                      Automated Matching
                    </h4>
                    <p className="text-sm sm:text-base text-center text-muted-foreground">
                      Automatically match images to your Shopify products based
                      on SKU names.
                    </p>
                  </motion.div>
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-4xl">🔗</span>
                    <h4 className="text-xl sm:text-2xl font-semibold mt-2 text-primary">
                      Seamless Integration
                    </h4>
                    <p className="text-sm sm:text-base text-center text-muted-foreground">
                      Integrates seamlessly with your Shopify store, no need for
                      third-party apps.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.section>




       
        </>
      </div>
    </div>
  );
}
