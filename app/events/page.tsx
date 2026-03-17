/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { Calendar, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Footer from '@/components/Footer'

interface EventWithId {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link?: string;
  author: string;
  authorId: string;
  createdAt?: Timestamp;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithId[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventWithId[]
      setEvents(eventsData)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Floating Pill Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-5 px-4">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-3.5 w-full max-w-4xl relative z-50 border border-white/20">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/images/asset1.png" alt="Google Student Ambassador" className="h-10 w-auto object-contain" />
          </Link>
          <Link href="/">
            <Button variant="ghost" className="rounded-full font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Home
            </Button>
          </Link>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-6xl px-4 pt-32 pb-20 flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1e293b] tracking-tight">
            Events <span className="text-[#0ea5e9]">GSA</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            Temukan berbagai event menarik dari Google Student Ambassador. Jangan sampai ketinggalan keseruannya!
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-md mb-12 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            type="text" 
            placeholder="Cari event..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-full border-2 border-white bg-white shadow-lg focus-visible:ring-blue-400 focus-visible:border-blue-400 text-lg font-medium transition-all"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 animate-pulse">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-400 font-bold">Sedang memuat event...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[40px] border-2 border-white shadow-sm w-full">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Event tidak ditemukan</h3>
            <p className="text-gray-500">Coba gunakan kata kunci pencarian lainnya.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full px-4">
            {filteredEvents.map((event, index) => {
              const rotations = ['rotate-[1deg]', 'rotate-[-2deg]', 'rotate-[2deg]', 'rotate-[-1deg]']
              
              return (
                <div
                  key={event.id}
                  className={`group relative bg-white p-4 pb-6 rounded-[32px] shadow-xl border-[6px] border-white transform transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl flex flex-col items-center ${rotations[index % rotations.length]}`}
                >
                  {/* Decorative Corner Icons */}
                  <img src="/images/asset7.png" alt="" className="absolute -top-4 -left-4 w-10 h-10 object-contain drop-shadow-md z-20" />
                  <img src="/images/asset8.png" alt="" className="absolute -bottom-4 -right-4 w-10 h-10 object-contain drop-shadow-md z-20" />

                  <div className="w-full aspect-[3/4] bg-blue-50 rounded-2xl flex items-center justify-center mb-5 overflow-hidden relative border border-blue-100">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover shadow-inner group-hover:scale-105 transition-transform duration-700" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex flex-col items-center justify-center p-4">
                      {event.link ? (
                        <Button 
                          onClick={() => window.open(event.link, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-all flex items-center gap-2"
                        >
                          Ikuti Event <Calendar className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-white font-bold text-center px-4 py-2 bg-gray-800/80 rounded-full">Coming Soon</span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-extrabold text-[#1e293b] text-center text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors uppercase">{event.title}</h4>
                  <p className="text-sm text-[#0ea5e9] font-bold text-center italic">{event.subtitle}</p>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
