"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";
export const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
  },
   {
    href: "/pix",
    label: "Pix",
  },
  {
    href: "/compress",
    label: "Compress",
  },
  {
    href: "/effects",
    label: "Effects",
  },
  {
    href: "/resize",
    label: "Resize",
  },
  {
    href: "/pdf-to-image",
    label: "PDF to Image",
  },
  {
    href: "/metadata",
    label: "Metadata",
  },
];

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <header className="w-full flex justify-center py-5 px-6 relative z-[50]">
      {/* NAV CONTAINER */}
      <div 
       className="h-[90px] container flex items-center  bg-[rgba(142,142,142,0.20)] rounded-[20px] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] items-center absolute inset-x-0 z-[50]">

        {/* LEFT — LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/bblogo.webp"
            alt="Logo"
            width={250}
            height={80}
            className="object-contain px-6"
            priority
          />
        </Link>

        {/* CENTER — LINKS */}
        <nav className="flex-1 flex justify-center">
          <ul className="flex items-center gap-8 font-medium text-[18px] text-black">

            {NAV_LINKS.map((link) => {

              // ✅ Proper active route detection
              const active =
                pathname === link.href ||
                (link.href !== "/" &&
                  pathname.startsWith(link.href));

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition-all duration-200 ${
                      active
                        ? "font-semibold underline underline-offset-4"
                        : "hover:opacity-70"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

          </ul>
        </nav>

        {/* RIGHT — BUTTON */}
        <div className="flex items-center">
          <Button
            href="https://bombayblokes.com/contactus"
            text="Start Growing"
            className="text-black"
          />
        </div>

      </div>
    </header>
  );
}