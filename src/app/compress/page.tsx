import React from 'react'
import Navbar from '../components/Navbar'
import Compress from '../components/Compress'
import Footer from '../components/Footer'
import SmoothScroll from '../components/SmoothScroll'
import Taxi from '../components/Taxi'

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Images & PDFs Online | Bombay Blokes",
  description:
    "Shrink image and PDF file sizes in seconds without noticeable quality loss. Ideal for email attachments, faster uploads, and web performance. 100% free, secure processing, and works directly in your browser.",
};

const Index = () => {
  return (
    <div>
      <SmoothScroll>
      <Taxi/> 
      <Navbar />
      <Compress />
      <Footer />
      </SmoothScroll>
    </div>
  )
}

export default Index