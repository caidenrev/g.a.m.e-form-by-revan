/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { Calendar, ArrowLeft, Search, Menu, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
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
  const { user } = useAuth()
  const [events, setEvents] = useState<EventWithId[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-5 px-4 w-full">
        <div className="w-full max-w-2xl flex items-center justify-between bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-full shadow-lg border border-white/20">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/images/asset1.png" alt="GSA" className="h-8 w-auto object-contain" />
          </Link>
          
          <div className="flex items-center gap-2">
            {user && (
              <div title={user.displayName || user.email || ''} className="w-8 h-8 rounded-full overflow-hidden border-2 border-green-500 shadow-sm">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer ml-1"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-gray-600 hover:text-blue-500 transition-colors" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className={`absolute top-[76px] w-full max-w-lg px-4 transition-all duration-300 origin-top z-40 ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl mt-2 border border-blue-50 p-2 flex flex-col w-full">
            <Link href="/#members" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Members
            </Link>
            <Link href="/#recap" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Recap
            </Link>
            <Link href="/gallery" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Gallery
            </Link>
            <Link href="/events" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Events
            </Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              About
            </Link>

            {/* Divider */}
            {user && <div className="h-px bg-gray-200 my-2 mx-3"></div>}

            {/* User Menu */}
            {!user ? (
              <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            ) : (
              <>
                <Link href="/my-profile" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Admin Dashboard
                </Link>
              </>
            )}
          </div>
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
