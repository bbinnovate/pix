import React from 'react'
import Navbar from '../components/Navbar'
import Resize from '../components/Resize'
import Footer from '../components/Footer'
import SmoothScroll from '../components/SmoothScroll'
import Taxi from '../components/Taxi'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Resizer Online | Bombay Blokes",
  description:
    "Resize images to exact dimensions for Instagram, websites, forms, and documents. Maintain clarity while adjusting size instantly. Drag-and-drop interface, universal format support, and free secure downloads.",
};

const Index = () => {
  return (
    <div>
      <SmoothScroll>
      <Taxi/> 
      <Navbar/>
      <Resize/>
      <Footer/>
      </SmoothScroll>
    </div>
  )
}

export default Index