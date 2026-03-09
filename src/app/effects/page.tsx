import React from 'react'
import Navbar from '../components/Navbar'
import Effect from '../components/Effect'
import Footer from '../components/Footer'
import SmoothScroll from '../components/SmoothScroll'
import Taxi from '../components/Taxi'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Photo Effects Editor | Bombay Blokes",
  description:
    "Enhance photos with stylish filters, color tuning, and creative effects in one click. Designed for fast, high-quality visual editing without complex software. Free, beginner-friendly, and fully browser-based.",
};

const Index = () => {
  return (
    <div>
      <SmoothScroll>
      <Taxi/> 
      <Navbar/>
      <Effect/>
      <Footer/>
      </SmoothScroll>
    </div>
  )
}

export default Index