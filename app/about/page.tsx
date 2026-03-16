/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy, Medal, Star } from 'lucide-react'
import Footer from '@/components/Footer'

interface SaweriaDonator {
  donator: string;
  amount: number;
}

interface Donation {
  id: string;
  donator: string;
  amount: number;
}

export default function AboutPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch('/api/saweria')
        const result = await response.json()
        if (result.data) {
          // Sort by amount desc just in case Saweria doesn't
          const sortedData = [...result.data].sort((a: SaweriaDonator, b: SaweriaDonator) => b.amount - a.amount).slice(0, 15)
          setDonations(sortedData.map((d: SaweriaDonator, index: number) => ({
            id: index.toString(),
            donator: d.donator,
            amount: d.amount
          })))
        }
      } catch (error) {
        console.error('Error fetching donations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
    // Refresh every 5 minutes
    const interval = setInterval(fetchDonations, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-5 px-4 w-full">
        <div className="w-full max-w-2xl flex items-center justify-between bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-full shadow-lg border border-white/20">
          <img src="/images/asset1.png" alt="GSA" className="h-8 w-auto object-contain" />
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700">
            Kembali <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Main Content Wrapper with Offset */}
      <div className="relative z-10 w-full max-w-4xl px-4 pt-28 pb-8 flex flex-col items-center">

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm">
            Tentang <span className="text-[#0ea5e9]">Portal GSA</span>
          </h1>
          <p className="text-[#475467] font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            Wadah kolaborasi bagi alumni dan member GSA untuk tetap saling berkoneksi, berbagi informasi program terbaru, dan berkembang bersama di ekosistem Google.
          </p>
        </div>

        {/* Content Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 px-4">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-white transform transition-transform hover:scale-[1.03]">
            <img src="/images/asset6.png" alt="Ekosistem Terkoneksi" className="w-32 h-32 object-contain mb-6 drop-shadow-sm" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ekosistem Terkoneksi</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Memastikan seluruh alumni dan member GSA tetap saling terhubung untuk berkolaborasi dan terus berkembang di dalam ekosistem Google.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-white transform transition-transform hover:scale-[1.03]">
            <img src="/images/site-icon.png" alt="Sharing" className="w-24 h-24 object-contain mb-6 drop-shadow-sm" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Alumni Sharing</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Wadah bagi para alumni untuk saling berbagi informasi mengenai program-program terbaru dari Google agar komunitas tetap update.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-white transform transition-transform hover:scale-[1.03]">
            <img src="/images/asset5.png" alt="Tips" className="w-24 h-24 object-contain mb-6 drop-shadow-sm" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Tips & Tricks</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Berbagi wawasan, tips, dan trik eksklusif untuk memaksimalkan potensi diri dan tumbuh bersama di dalam komunitas Google.
            </p>
          </div>
        </div>

        {/* Author Section */}
        <div className="relative w-full max-w-3xl mb-20 group">
          {/* Decoration Assets (Moved outside overflow-hidden) */}
          <img src="/images/asset7.png" alt="" className="absolute -top-6 -left-6 w-16 h-16 object-contain drop-shadow-xl z-30 pointer-events-none animate-bounce-slow" />
          <img src="/images/asset8.png" alt="" className="absolute top-1/3 -right-6 w-12 h-12 object-contain drop-shadow-xl z-30 pointer-events-none animate-float" />
          <img src="/images/asset9.png" alt="" className="absolute bottom-10 -left-6 w-14 h-14 object-contain drop-shadow-xl z-30 pointer-events-none animate-pulse-slow" />
          <img src="/images/asset10.png" alt="" className="absolute -bottom-8 right-12 w-20 h-20 object-contain drop-shadow-xl z-30 pointer-events-none animate-float" style={{ animationDelay: '1s' }} />

          <div className="bg-white rounded-[50px] shadow-2xl border-8 border-white overflow-hidden transform transition-all group-hover:shadow-blue-100 relative z-20">
            <div className="flex flex-col md:flex-row">
              {/* Photos Side */}
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-blue-50/20">
                <div className="grid grid-cols-2 gap-4 relative">
                  <div className="relative aspect-square rounded-[32px] overflow-hidden shadow-md border-4 border-white">
                    <img src="/images/ngoding.jpeg" alt="Eka Revandi 1" className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                  </div>
                  <div className="relative aspect-square rounded-[32px] overflow-hidden shadow-md mt-8 border-4 border-white">
                    <img src="/images/revan2.jpeg" alt="Eka Revandi 2" className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                  </div>
                </div>
              </div>

              {/* Info Side */}
              <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-gradient-to-br from-white to-blue-50/30">
                <p className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-3">The Architect</p>
                <h2 className="text-3xl font-extrabold text-[#1e293b] mb-4">Eka Revandi</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed italic">
                    Portal ini diciptakan sebagai bentuk apresiasi saya terhadap komunitas GSA. Harapannya, setiap baris kode di sini bisa membantu member lain untuk tumbuh dan belajar bersama.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm">Google Cloud Innovator</span>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm">Technical Expert</span>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm">Cloud System Engineer</span>
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm">Software Engineer II</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Section (Saweria) */}
        <div className="w-full max-w-3xl mb-8 px-4">
          <div className="relative bg-gradient-to-br from-orange-400 to-yellow-500 p-8 sm:p-10 rounded-[40px] shadow-2xl overflow-hidden group w-full border-4 border-white">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="flex-1 space-y-3">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                  85% Gaji gua abis bayar tagihan server cloud gara gara klean
                </h2>
                <p className="text-white/90 font-bold text-xs sm:text-sm leading-relaxed">
                  Woi patungan bayar server lah kocak, gaji gua abis ama lu pada buat generate app timpa ini itu ancrit klean
                </p>
              </div>

              <div className="flex-shrink-0">
                <a 
                  href="https://saweria.co/RevanMalesNgoding" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-6 py-3 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl active:scale-95 transition-all text-sm"
                >
                  <img src="https://saweria.co/favicon.ico" alt="" className="w-5 h-5 object-contain" />
                  Patungan di Saweria
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Leaderboard / Feed */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-orange-500 font-black animate-pulse text-lg tracking-widest">MENYUDAHI KEHAUSAN DATA...</p>
          </div>
        ) : donations.length > 0 && (
          <div className="w-full max-w-2xl px-4 mb-20 animate-in slide-in-from-bottom duration-700">
            <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 border-2 border-white shadow-xl">
              <div className="flex items-center gap-3 mb-8 justify-center">
                <div className="bg-yellow-100 p-2.5 rounded-2xl shadow-sm border border-yellow-200">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Wall of Fame <span className="text-orange-500">Supporters</span></h2>
              </div>

              <div className="w-full space-y-6">
                {donations.map((donation, index) => (
                  <div 
                    key={donation.id} 
                    className={`relative p-5 rounded-[32px] transition-all hover:scale-[1.02] border-2 shadow-sm ${
                      index === 0 ? 'bg-yellow-50/50 border-yellow-200' : 
                      index === 1 ? 'bg-slate-50/50 border-slate-200' :
                      index === 2 ? 'bg-orange-50/50 border-orange-200' :
                      'bg-white/50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-md transform rotate-[-3deg] ${
                          index === 0 ? 'bg-yellow-400' : 
                          index === 1 ? 'bg-slate-400' :
                          index === 2 ? 'bg-orange-400' :
                          'bg-blue-400'
                        }`}>
                          {index === 0 ? <Star className="w-6 h-6" /> : index + 1}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-lg leading-tight uppercase tracking-tight">{donation.donator}</p>
                          <p className="text-blue-600 font-black text-sm">{formatCurrency(donation.amount)}</p>
                        </div>
                      </div>
                      
                      {index < 3 && (
                        <div className="hidden sm:block">
                          {index === 0 ? <Trophy className="w-8 h-8 text-yellow-400 opacity-20" /> : <Medal className="w-8 h-8 text-gray-400 opacity-10" />}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-4 bg-orange-50 rounded-3xl border border-orange-100 text-center">
                <p className="text-[10px] sm:text-xs text-orange-600 font-bold italic leading-relaxed">
                  Leaderboard ini terhubung secara otomatis ke Saweria. Update data terjadi setiap saat. <br className="hidden sm:block" />
                  Gaji gua aman, lu seneng, portal jalan terus. Thank you klean! ❤️
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}
