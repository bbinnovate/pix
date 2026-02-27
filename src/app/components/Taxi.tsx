"use client";

import React, { useEffect, useState } from "react";
import { motion, useTransform, useMotionValue } from "framer-motion";
import { usePathname } from "next/navigation";

const Taxi = () => {
  const pathname = usePathname();
  const scrollY = useMotionValue(0);
  const [docHeight, setDocHeight] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const getTaxiWidth = () => {
    if (typeof window === "undefined") return 120;
    if (window.innerWidth < 480) return 70;
    if (window.innerWidth < 768) return 90;
    return 120;
  };

  const [taxiWidth, setTaxiWidth] = useState(getTaxiWidth());

  useEffect(() => {
    const updateSizes = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const fullDocHeight = document.documentElement.scrollHeight;

      setViewportHeight(vh);
      setViewportWidth(vw);
      setTaxiWidth(getTaxiWidth());

      // Ensure minimum docHeight to allow full taxi movement
      const scrollableHeight = Math.max(fullDocHeight - vh, 100);
      setDocHeight(scrollableHeight);
    };

    const handleScroll = () => scrollY.set(window.scrollY);

    window.addEventListener("resize", updateSizes);
    window.addEventListener("scroll", handleScroll);

    const timer = setTimeout(updateSizes, 100);
    updateSizes();
    handleScroll();

    return () => {
      window.removeEventListener("resize", updateSizes);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, [scrollY, pathname]);

  const distance = Math.max(viewportWidth - taxiWidth - 10, 0);

  // Map scrollY to horizontal position
  const x = useTransform(scrollY, [0, docHeight], [0, distance]);

  const bottomOffset =
    viewportWidth < 480
      ? Math.max(viewportHeight * 0.10, 60)
      : viewportWidth < 768
      ? Math.max(viewportHeight * 0.08, 40)
      : 20;


        // ✅ Hide taxi on phones (below 768px)
  if (viewportWidth < 768) {
    return null;
  }

  return (
    <motion.img
      src="/images/taxi.png"
      alt="Taxi"
      style={{
        position: "fixed",
        bottom: bottomOffset,
        left: 0,
        x,
        width: taxiWidth,
        height: "auto",
        zIndex: 50,
        pointerEvents: "none",
      }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
    />
  );
};

export default Taxi;