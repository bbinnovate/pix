import React from 'react'
import Navbar from '../components/Navbar'
import Upload from './Uploads'
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
      <Upload/>
      <Footer/>
      </SmoothScroll>
    </div>
  )
}

export default Index