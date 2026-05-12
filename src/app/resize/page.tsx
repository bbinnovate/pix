import React from 'react'
import Header from '../components/Header'
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
      <Header/>
      <Resize/>
      </SmoothScroll>
    </div>
  )
}

export default Index