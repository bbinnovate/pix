import React from 'react'
import Navbar from '../components/Navbar'
import MetadataPage from '../components/Metadata'
import Footer from '../components/Footer'
import SmoothScroll from '../components/SmoothScroll'
import Taxi from '../components/Taxi'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Image Compression Tool | Bombay Blokes",
  description:
    "Compress your images online with our free image compression tool. Reduce file size without sacrificing quality, perfect for web optimization and faster loading times.",
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