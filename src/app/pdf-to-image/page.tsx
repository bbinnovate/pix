import React from 'react'
import Navbar from '../components/Navbar'
import PdfToImage from '../components/PdfToImage'
import Footer from '../components/Footer'
import SmoothScroll from '../components/SmoothScroll'
import Taxi from '../components/Taxi'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert PDF to JPG & PNG Online | Bombay Blokes",
  description:
    "Turn PDF pages into high-quality JPG or PNG images instantly. Great for presentations, design work, and easy sharing. No software required, secure file handling, and quick browser-based conversion.",
};

const Index = () => {
  return (
    <div>
      <SmoothScroll>
      <Taxi/> 
      <Navbar/>
      <PdfToImage/>
      <Footer/>
      </SmoothScroll>
    </div>
  )
}

export default Index