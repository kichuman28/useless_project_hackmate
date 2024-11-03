'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import Navbar from '../components/Navbar'
import { AuroraBackground } from "../components/ui/aurora-background"
import '../app/globals.css'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <AuroraBackground>
        <main className="container mx-auto px-4 py-16 pt-24">
          <motion.section
            className="flex flex-col items-center justify-center text-center h-[calc(100vh-6rem)]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
          >
            <h1 className="text-4xl md:text-7xl font-bold mb-4 text-black">
              looking for a great team?
            </h1>
            <h2 className="text-2xl md:text-4xl mb-8 text-black font-extralight">
              stress no more.
            </h2>
            <Button
              className="bg-white text-black px-8 py-3 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => window.location.href = '/discover'}
            >
              find now
            </Button>
          </motion.section>
        </main>
      </AuroraBackground>
    </div>
  )
}
