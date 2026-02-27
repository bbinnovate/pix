import React from 'react'
import Navbar from './components/Navbar'
import FirstSection from './components/FirstSection'
import SecondSection from './components/SecondSection'
import ThirdSection from './components/ThirdSection'
import Footer from './components/Footer'
import SmoothScroll from './components/SmoothScroll'
import Taxi from './components/Taxi'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Free Online Tools | Bombay Blokes",
  description:
    "Explore powerful online tools to compress, resize, edit, and optimize images effortlessly. Fast, simple, and built to streamline your workflow with smart digital utilities.",
};
const Index = () => {
  return (
    <div>
      <SmoothScroll>
      <Taxi/> 
      <Navbar />
      <FirstSection />
      <SecondSection />
      <ThirdSection />
      <Footer />
      </SmoothScroll>
    </div>
  )
}

export default Index