"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Button from "./Button";

export const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "https://expenses.bombayblokes.com",
    label: "Expense Tracker",
  },
  {
    href: "/pdf-to-image",
    label: "PDF to Image",
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
];

export default function DesktopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <header className="w-full flex justify-center relative z-[999]">
      {/* NAV CONTAINER */}
      <div className="h-[90px] flex items-center bg-[rgba(142,142,142,0.20)] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] absolute inset-x-0 z-[999]">
        
        <div className="flex items-center justify-between container mx-auto px-4 lg:px-0">
          
          {/* LEFT — LOGO */}
          <Link href="/" className="flex items-center z-[1000]">
            <Image
              src="/images/bblogo.webp"
              alt="Logo"
              width={220}
              height={80}
              className="object-contain w-[170px] sm:w-[200px] lg:w-[220px]"
              priority
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-8 font-medium text-[18px] text-black">
              {NAV_LINKS.map((link) => {
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

          {/* DESKTOP BUTTON */}
          <div className="hidden lg:flex items-center">
            <Button
              href="https://bombayblokes.com/contactus"
              text="Start Growing"
              className="text-black"
            />
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-full "
          >
            {isOpen ? (
              <X size={26} className="text-black" />
            ) : (
              <Menu size={26} className="text-black" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] transition-all duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-[340px] bg-white z-[999] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-all duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* TOP */}
        <div className="flex items-center justify-between p-5 border-b border-black/10">
          <Image
            src="/images/bblogo.webp"
            alt="Logo"
            width={160}
            height={60}
            className="object-contain"
          />

          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center"
          >
            <X size={24} className="text-black" />
          </button>
        </div>

        {/* MOBILE LINKS */}
        <nav className="px-6 py-8">
          <ul className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" &&
                  pathname.startsWith(link.href));

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-[18px] transition-all duration-200 ${
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

          {/* MOBILE BUTTON */}
          <div className="mt-10">
            <Button
              href="https://bombayblokes.com/contactus"
              text="Start Growing"
              className="text-black justify-center"
            />
          </div>

        
        </nav>
      </div>
    </header>
  );
}