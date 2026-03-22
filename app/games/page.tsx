/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function GamesHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-28 pb-10 px-4 relative overflow-hidden">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 text-center mb-10 mt-4">
        <img src="/images/Smile-Light.png" className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-xl mx-auto mb-6 hover:scale-110 transition-transform duration-300" alt="Arcade Icon" />
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight drop-shadow-sm">GSA Arcade</h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto text-base sm:text-lg px-4">
          Pilih permainan untuk mengisi waktu luang dan asah tangkasmu dalam ekosistem GSA!
        </p>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-2 sm:px-0">
        {/* Game 1: Flappy Dino */}
        <Link href="/game" className="group bg-blue-50 rounded-[32px] p-6 sm:p-8 shadow-xl border-[5px] border-blue-50 hover:border-blue-100 transition-all hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none transform translate-x-4 -translate-y-4">
            <img src="/images/asset7.png" alt="Dino Decor" className="w-full h-full object-contain" />
          </div>
          
          <img src="/game-assets/sprites/dino.png" className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 transform scale-x-[-1]" alt="Flappy Dino" />
          <h2 className="text-2xl sm:text-3xl font-black text-blue-900 mb-2 whitespace-nowrap">Flappy Dino</h2>
          <p className="text-gray-500 font-medium leading-relaxed flex-1 text-sm sm:text-base relative z-10">
            Bantu burung biru melompati rintangan pipa bergaya klasik. Mainkan terus untuk mendapatkan High Score tertinggi!
          </p>
          <div className="mt-8 relative inline-flex w-max bg-gray-50 px-5 py-2.5 rounded-full group-hover:bg-blue-50 transition-colors z-10 border border-gray-100 group-hover:border-blue-200">
            <span className="font-extrabold text-blue-600 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">Mainkan Sekarang <ArrowLeft className="w-4 h-4 rotate-180" /></span>
          </div>
        </Link>

        {/* Game 2: Memory Match */}
        <Link href="/memory" className="group bg-white rounded-[32px] p-6 sm:p-8 shadow-xl border-[5px] border-white hover:border-blue-100 transition-all hover:-translate-y-2 flex flex-col relative overflow-hidden">
          <img src="/images/asset7.png" alt="Dino Decor" className="absolute -top-4 -right-4 w-48 sm:w-72 opacity-20 group-hover:rotate-12 transition-transform pointer-events-none" />
          <div className="absolute top-6 right-6 bg-red-500 text-white text-[10px] sm:text-xs font-black px-3 sm:px-4 py-1.5 rounded-full shadow-lg border-2 border-white animate-pulse z-20">
            NEW
          </div>
          
          <img src="/images/Picture-Dark.png" alt="Memory Icon" className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-xl mb-6 group-hover:scale-110 transition-transform group-hover:-rotate-6 relative z-10" />
          <h2 className="text-2xl font-black text-gray-800 mb-3 group-hover:text-blue-600 transition-colors relative z-10">Memory Match</h2>
          <p className="text-gray-500 font-medium leading-relaxed flex-1 text-sm sm:text-base relative z-10">
            Uji daya ingatmu! Temukan pasangan kartu member GSA yang tersembunyi dengan cepat sebelum nyawamu habis.
          </p>
          <div className="mt-8 relative inline-flex w-max bg-gray-50 px-5 py-2.5 rounded-full group-hover:bg-blue-50 transition-colors z-10 border border-gray-100 group-hover:border-blue-200">
            <span className="font-extrabold text-blue-600 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">Uji Ingatan <ArrowLeft className="w-4 h-4 rotate-180" /></span>
          </div>
        </Link>
      </div>
      <Footer />
    </div>
  )
}
