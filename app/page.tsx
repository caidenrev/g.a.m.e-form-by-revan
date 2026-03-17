/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, Menu, LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useAuth, GSAMemberData } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import Footer from '@/components/Footer'

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  createdAt?: Timestamp;
  author: string;
  authorId: string;
  authorPhoto?: string;
  authorTier?: 'Rising Star' | 'Achiever' | 'Stabilizer';
  authorCampus?: string;
}

interface MemberWithId extends GSAMemberData {
  id: string;
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [members, setMembers] = useState<MemberWithId[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[]
      setBlogPosts(postsData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemberWithId[]
      setMembers(membersData)
    })
    return () => unsubscribe()
  }, [])

  // Truly Infinite Scroll Logic
  useEffect(() => {
    if (!scrollRef.current || members.length === 0) return
    const container = scrollRef.current

    // Set initial position to the middle section
    const scrollWidth = container.scrollWidth
    const firstSetWidth = scrollWidth / 3
    container.scrollLeft = firstSetWidth

    const handleScroll = () => {
      const currentScroll = container.scrollLeft
      const sectionWidth = container.scrollWidth / 3

      // If scrolled near the end of the third set, jump back to second set
      if (currentScroll >= sectionWidth * 2) {
        container.scrollLeft = currentScroll - sectionWidth
      }
      // If scrolled near the start of the first set, jump forward to second set
      else if (currentScroll <= 0) {
        container.scrollLeft = currentScroll + sectionWidth
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [members])

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollRef.current || members.length === 0 || isPaused) return

    const scrollContainer = scrollRef.current
    let animationId: number

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 2.5 // Increased speed as requested earlier
      }
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animationId)
  }, [members, isPaused])

  const instructors = [
    { name: 'GSA 2025 Graduation', role: 'Ciputra Artpreneur', image: '/images/graduation.jpeg' },
    { name: 'GSA 2025 Inauguration', role: 'MGP Space Jakarta', image: '/images/inauguration2.jpeg' },
    { name: 'Google Office Tour', role: 'Pasific Century Place Jakarta', image: '/images/inauguration.jpeg' }
  ]



  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Floating Pill Header with Dropdown */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-5 px-4">
        {/* Main Pill */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-3.5 w-full max-w-lg relative z-50 border border-white/20">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/images/asset1.png" alt="Google Student Ambassador" className="h-10 w-auto object-contain" />
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
            <Link href="#members" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Members
            </Link>
            <Link href="#blog" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Blog
            </Link>
            <Link href="/gallery" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Gallery
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
                <Link href="/my-articles" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Artikel Saya
                </Link>
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                </Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="px-5 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors flex items-center gap-2 w-full text-left">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full py-8 mt-24 space-y-16 flex flex-col items-center">

        {/* Top Sections Container (Restricted Width) */}
        <div className="w-full max-w-4xl px-4 flex flex-col items-center">

          {/* Page Headlines */}
          <div className="text-center mt-6 mb-2 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm">
              Halo Temen temen aku! Welcome to GSA Portal!
            </h1>
            <p className="text-[#475467] font-medium max-w-xl mx-auto text-lg">
              Jadi aku bikin Portal ini buat kenang kenangan dari aku ya temen temen, hopefully kalian bakal suka sih dan project ini juga open source yang mau contribute ke contact aja ya wkwk
            </p>
          </div>

          {/* Scattered Instructor Cards */}
          <div id="speaker" className="flex flex-wrap justify-center gap-x-8 gap-y-16 sm:gap-x-12 sm:gap-y-20 mt-8 mb-20 px-4 scroll-mt-32">

            {instructors.map((instructor, index) => {
              // Alternate rotations for a scattered look
              const rotations = ['rotate-[-3deg]', 'rotate-[4deg]', 'rotate-[-2deg]']
              // Alternate icons for the corners (7, 8, 9, 10)
              const topLeftIcon = `/images/asset${(index % 4) + 7}.png`
              const bottomRightIcon = `/images/asset${((index + 2) % 4) + 7}.png`

              return (
                <div
                  key={index}
                  className={`relative bg-white p-5 pb-7 rounded-[32px] shadow-2xl border-[5px] border-white transform transition-transform hover:scale-105 hover:z-10 w-72 sm:w-80 flex flex-col items-center ${rotations[index % rotations.length]}`}
                >
                  {/* Decorative Corner Icons */}
                  <img src={topLeftIcon} alt="Decoration" className="absolute -top-6 -left-6 w-14 h-14 object-contain drop-shadow-md z-20 pointer-events-none hover:rotate-12 transition-transform" />
                  <img src={bottomRightIcon} alt="Decoration" className="absolute -bottom-6 -right-6 w-14 h-14 object-contain drop-shadow-md z-20 pointer-events-none hover:-rotate-12 transition-transform" />

                  <div className="w-full aspect-[4/3] bg-blue-50/80 rounded-2xl flex items-center justify-center mb-5 overflow-hidden relative border border-blue-100">
                    {/* Instructor Photo */}
                    <img src={instructor.image} alt={instructor.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-extrabold text-gray-800 text-center text-lg leading-tight mb-1.5">{instructor.name}</h4>
                  <p className="text-sm text-[#0ea5e9] font-bold text-center">{instructor.role}</p>
                </div>
              )
            })}
          </div>

          {/* GSA 2025 RECAP Section */}
          <div id="recap" className="w-full flex flex-col items-center mb-10 mt-6 scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#475467] mb-6 tracking-tight uppercase">
              GSA 2025 <span className="text-[#0ea5e9]">RECAP</span>
            </h2>
            <div className="relative bg-white p-2 sm:p-4 rounded-[32px] sm:rounded-[48px] shadow-2xl border-[6px] sm:border-[8px] border-white transform transition-transform hover:scale-[1.01] max-w-3xl w-full">

              {/* Decorative Corner Icons */}
              <img src="/images/asset7.png" alt="Decoration" className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-12 h-12 sm:w-20 sm:h-20 object-contain drop-shadow-md z-20 pointer-events-none" />
              <img src="/images/asset8.png" alt="Decoration" className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-8 w-12 h-12 sm:w-20 sm:h-20 object-contain drop-shadow-md z-20 pointer-events-none" />

              {/* Video Container */}
              <div className="w-full aspect-video rounded-2xl sm:rounded-[32px] overflow-hidden bg-black relative z-10 shadow-inner">
                <iframe
                  src="https://drive.google.com/file/d/1nss8O14m-3uYgGJBHCx6CzVsD3eYyMNs/preview"
                  className="w-full h-full border-0"
                  allow="autoplay"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* List Member Section - Full Width */}
        <div id="members" className="w-full flex flex-col items-center scroll-mt-32">
          <div className="max-w-4xl w-full px-4 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#475467] mb-3 leading-snug">
              Member <span className="text-[#0ea5e9]">GSA</span>
            </h2>
            <p className="text-gray-500 text-sm mb-4">Google Student Ambassador Community</p>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-medium">Belum ada member terdaftar.</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Member Cards Carousel - Full width */}
              <div
                ref={scrollRef}
                className="w-full overflow-x-auto no-scrollbar py-12 cursor-grab active:cursor-grabbing flex"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                <div className="flex gap-x-8 sm:gap-x-12 px-10">
                  {/* Duplicate members for better scroll feel */}
                  {[...members, ...members, ...members].map((member, index) => {
                    const getTierColor = (tier?: string) => {
                      switch (tier) {
                        case 'Rising Star': return 'bg-blue-100 text-blue-600'
                        case 'Achiever': return 'bg-pink-100 text-pink-600'
                        case 'Stabilizer': return 'bg-purple-100 text-purple-600'
                        default: return 'bg-gray-100 text-gray-600'
                      }
                    }

                    const rotations = ['rotate-[-3deg]', 'rotate-[4deg]', 'rotate-[-2deg]']
                    const topLeftIcon = `/images/asset${(index % 4) + 7}.png`
                    const bottomRightIcon = `/images/asset${((index + 2) % 4) + 7}.png`

                    return (
                      <div
                        key={`${member.id}-${index}`}
                        className={`relative bg-white p-5 pb-7 rounded-[32px] shadow-2xl border-[5px] border-white transform transition-transform hover:scale-105 hover:z-10 w-72 sm:w-80 flex flex-col items-center ${rotations[index % rotations.length]} flex-shrink-0`}
                      >
                        {/* Decorative Corner Icons */}
                        <img src={topLeftIcon} alt="Decoration" className="absolute -top-6 -left-6 w-14 h-14 object-contain drop-shadow-md z-20 pointer-events-none hover:rotate-12 transition-transform" />
                        <img src={bottomRightIcon} alt="Decoration" className="absolute -bottom-6 -right-6 w-14 h-14 object-contain drop-shadow-md z-20 pointer-events-none hover:-rotate-12 transition-transform" />

                        <div className="w-full aspect-[4/3] bg-blue-50/80 rounded-2xl flex items-center justify-center mb-5 overflow-hidden relative border border-blue-100">
                          <img
                            src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=fff`}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <h4 className="font-extrabold text-gray-800 text-center text-lg leading-tight mb-1.5">{member.name}</h4>
                        <div className="flex flex-wrap justify-center items-center gap-1 mb-2">
                          {member.tier && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTierColor(member.tier)}`}>
                              {member.tier}
                            </span>
                          )}
                          {member.gsaId && (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {member.gsaId}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#0ea5e9] font-bold text-center">{member.campus}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {members.length > 0 && (
                <Link href="/members" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all mt-4 inline-flex items-center gap-2">
                  Liat Semua Member
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Bottom Sections Container (Restricted Width) */}
        <div className="w-full max-w-4xl px-4 flex flex-col items-center">
          {/* The Blog Container */}
          <div id="blog" className="w-full flex flex-col items-center scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#475467] mb-8 leading-snug">
              Artikel <span className="text-[#0ea5e9]">Terbaru</span>
            </h2>

            <div className="w-full space-y-8">
              {blogPosts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-medium">Belum ada artikel yang diterbitkan.</p>
                </div>
              ) : (
                blogPosts.map((post) => {
                  const getTierColor = (tier?: string) => {
                    switch (tier) {
                      case 'Rising Star': return 'bg-blue-100 text-blue-600'
                      case 'Achiever': return 'bg-pink-100 text-pink-600'
                      case 'Stabilizer': return 'bg-purple-100 text-purple-600'
                      default: return 'bg-gray-100 text-gray-600'
                    }
                  }

                  return (
                    <Link key={post.id} href={`/blog/${post.id}`} className="block w-full">
                      <div className="relative bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[32px] shadow-lg border-4 border-white hover:shadow-xl transition-all group w-full">
                        <img src="/images/asset9.png" alt="Decoration" className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-8 h-8 sm:w-12 sm:h-12 object-contain drop-shadow-md z-20 pointer-events-none" />
                        <img src="/images/asset10.png" alt="Decoration" className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 object-contain drop-shadow-md z-20 pointer-events-none" />

                        <div className="flex flex-row items-center gap-4 sm:gap-8">
                          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[28px] overflow-hidden border-3 sm:border-4 border-blue-50 shadow-sm flex-shrink-0 bg-blue-50">
                            <img
                              src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=3b82f6&color=fff`}
                              alt={post.author}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          <div className="flex-1 space-y-2 sm:space-y-2.5">
                            <h3 className="text-base sm:text-2xl font-extrabold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{post.title}</h3>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="bg-blue-100 text-[#0ea5e9] text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">{post.category}</span>
                              {post.authorTier && (
                                <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${getTierColor(post.authorTier)}`}>
                                  {post.authorTier}
                                </span>
                              )}
                              {post.createdAt && (
                                <span className="text-gray-400 text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  {post.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-2">{post.excerpt}</p>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                              {post.author} {post.authorCampus && `• ${post.authorCampus}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Special Thanks Section */}
        <div className="w-full max-w-4xl px-4 flex flex-col items-center mt-20 mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b] leading-tight mb-4">
            Program ini terselenggara<br></br> berkat dukungan<br></br> luar biasa dari:
          </h2>
          <p className="text-gray-500 font-medium max-w-2xl mb-12">
            Terima kasih banyak kepada Dicoding Indonesia dan Google yang telah memberikan kesempatan bagi kami untuk belajar, bertumbuh, dan terkoneksi dalam ekosistem digital yang luar biasa ini.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-24 pb-10">
            <div className="group">
              <img
                src="/images/google-logo.png"
                alt="Google"
                className="h-8 sm:h-12 w-auto transition-transform duration-300"
              />
            </div>
            <div className="group">
              <img
                src="/images/dicoding-logo.png"
                alt="Dicoding"
                className="h-8 sm:h-12 w-auto transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
