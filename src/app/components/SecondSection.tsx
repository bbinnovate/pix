"use client";
import Image from "next/image";
import React from "react";
import Button from "./Button";

type CardData = {
   icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  href?: string;
  comingSoon?: boolean;
};




const cardsData: CardData[] = [
  {
    title: "Pix",
   description: "Bulk upload and match product images to Shopify SKUs.",
    image: "/images/calculator/Web-Development.png",
    buttonText: "Try Now",
    href: "/pix",
      icon:   (
        <svg id="fi_4400290" enable-background="new 0 0 512 512" 
        height="50" 
        viewBox="0 0 512 512" 
        width="50" 
        xmlns="http://www.w3.org/2000/svg"> 
        <path fill="#fab31e" d="m272 286.54v155.147c0 8.837-7.164 16-16 16s-16-7.163-16-16v-155.148l-42.821 42.822c-3.124 3.124-7.219 4.687-11.313 4.687s-8.189-1.563-11.313-4.687c-6.249-6.248-6.249-16.379 0-22.627l70.134-70.135c3-3.001 7.07-4.687 11.313-4.687s8.313 1.686 11.313 4.687l70.135 70.135c6.249 6.248 6.249 16.379 0 22.627-6.248 6.248-16.379 6.248-22.627 0zm214.787-64.698c-14.159-17.422-33.274-30.291-54.495-36.835-16.958-38.146-55.033-63.218-97.315-63.218-2.763 0-5.531.108-8.292.323-10.683-18.487-25.597-34.229-43.637-45.958-21.977-14.288-47.504-21.841-73.821-21.841-73.821 0-134.055 59.294-135.587 132.755-19.317 7.19-36.55 19.685-49.422 36.017-15.617 19.815-24.218 44.531-24.218 69.593 0 62.095 50.518 112.613 112.613 112.613h71.577c8.836 0 16-7.163 16-16s-7.164-16-16-16h-71.577c-44.45 0-80.613-36.163-80.613-80.613 0-36.715 25.954-69.667 61.713-78.353 7.6-1.846 12.752-8.916 12.181-16.716-.188-2.57-.284-5.153-.284-7.68 0-57.134 46.482-103.616 103.617-103.616 40.115 0 76.998 23.51 93.961 59.895 3.103 6.653 10.335 10.337 17.542 8.947 4.683-.906 9.477-1.366 14.248-1.366 31.624 0 59.883 20.046 70.319 49.881 1.824 5.217 6.212 9.123 11.605 10.331 36.562 8.19 63.098 41.278 63.098 78.677 0 44.45-36.163 80.613-80.613 80.613h-71.577c-8.836 0-16 7.163-16 16s7.164 16 16 16h71.577c62.095 0 112.613-50.519 112.613-112.613 0-25.673-8.954-50.829-25.213-70.836z"></path></svg>

    ),
  },
  {
    title: "Image Compression",
    description: "Compress multiple images with customizable quality and size settings.",
    image: "/images/calculator/Web-Development.png",
    buttonText: "Try Now",
    href: "/compress",
    icon: (
  <img
    src="/images/Compress.svg"
    alt="Image Effects"
    width={60}
    height={60}
  />
),
  },
  {
    title: "Image Effects",
    description: "Apply filters, adjust brightness, contrast,more to your images.",
    image: "/images/calculator/Web-Development.png",
     buttonText: "Try Now",
    href: "/effects",
    icon: (
  <img
    src="/images/Imageeffects.svg"
    alt="Image Effects"
    width={60}
    height={60}
  />
),
  },
  {
    title: "Image Resizer",
    description: "Resize single or multiple images while maintaining aspect ratio.",
    image: "/images/calculator/Web-Development.png",
     buttonText: "Try Now",
     href: "/resize",
      icon: (
  <img
    src="/images/Resizer.svg"
    alt="Image Effects"
    width={60}
    height={60}
  />
),
  },
  {
    title: "PDF to Image",
    description: "Convert PDF files to high-quality images with customizable settings.",
    image: "/images/calculator/Web-Development.png",
     buttonText: "Try Now",
     href: "/pdf-to-image",
     icon: (
  <img
    src="/images/transfer-data.svg"
    alt="Image Effects"
    width={80}
    height={80}
  />
),
  },
  {
    title: "Metadata Editor",
    description: "View and strip EXIF metadata from your images with fine-grained control.",
    image: "/images/calculator/Web-Development.png",
     buttonText: "Try Now",
     href: "/metadata",
      icon: (
  <img
    src="/images/metadata.svg"
    alt="Image Effects"
    width={60}
    height={60}
  />
),
  },
];

const SecondSection = () => {
  return (
    <section id="second-section"className="w-full container py-10 sm:py-15 lg:py-20 ">
      <div className=" mx-auto ">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardsData.map((card, index) => (
            <div
              key={index}
              className="relative bg-white border border-[#fab31e]  black-text rounded-3xl overflow-hidden shadow-lg"
            >
              {/* Yellow right strip */}
              <div className="absolute right-0 top-0 h-full w-3 sm:w-5 md:w-5  candy-border"></div>

              {/* Image */}
             <div className=" p-5 relative w-full h-auto mx-auto mt-4">
{card.icon}


</div>


              {/* Content */}
              <div className="p-6 flex flex-col justify-between h-auto">
                <div>
                  <h3 className="font-semibold mb-3">{card.title}</h3>
                  <p className="black-text body2">{card.description}</p>

                  
                </div>

                {/* Button */}
              <div className="mt-6 flex">
  <Button
    text="Try Now"
    href={card.href}
    className="w-full"
  />
</div>

              </div>
              
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecondSection;
