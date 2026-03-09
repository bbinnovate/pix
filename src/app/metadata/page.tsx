import React from 'react'
import Navbar from '../components/Navbar'
import MetadataPage from '../components/Metadata'
import Footer from '../components/Footer'
import SmoothScroll from '../components/SmoothScroll'
import Taxi from '../components/Taxi'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "View & Edit File Metadata Online | Bombay Blokes",
  description:
    "Inspect, edit, or remove image and file metadata easily. View EXIF, IPTC, and hidden file details, protect privacy, and prepare files for publishing. Free online tool with secure in-browser processing.",
};

const Index = () => {
  return (
    <div>
      <SmoothScroll>
      <Taxi/> 
      <Navbar/>
      <MetadataPage/>
      <Footer/>
      </SmoothScroll>
    </div>
  )
}

export default Index