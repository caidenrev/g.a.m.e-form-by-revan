/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, RefreshCcw } from 'lucide-react'
import { db } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { collection, getDocs } from 'firebase/firestore'
import { CloudinaryPresets } from '@/lib/cloudinary'

interface CardData {
  id: string
  memberId: string
  name: string
  photoURL: string | null
  campus?: string
  backIcon: string
}

const MAX_HEALTH = 5

export default function MemoryMatchPage() {
  const [gameState, setGameState] = useState<'LOADING' | 'ERROR' | 'PREVIEW' | 'PLAYING' | 'GAME_OVER' | 'WIN'>('LOADING')
  const [cards, setCards] = useState<CardData[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [health, setHealth] = useState(MAX_HEALTH)

  const shuffle = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const fetchAndSetup = useCallback(async () => {
    try {
      setGameState('LOADING')
      const snapshot = await getDocs(collection(db, 'members'))
      const allMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{id: string, name: string, photoURL?: string, campus?: string}>
      
      const shuffledMembers = shuffle(allMembers).slice(0, 6)
      
      if (shuffledMembers.length < 2) {
        setGameState('ERROR')
        return
      }
      
      const pairs = [...shuffledMembers, ...shuffledMembers]
      const gameCards = shuffle(pairs).map((m, idx) => ({
        id: `${m.id}-${idx}`,
        memberId: m.id,
        name: m.name,
        photoURL: m.photoURL || null,
        campus: m.campus || '',
        backIcon: Math.random() > 0.5 ? '/images/site-icon.png' : '/images/asset6.png'
      }))
      
      setCards(gameCards)
      setMatchedIds([])
      setFlippedIndices([])
      setHealth(MAX_HEALTH)
      setGameState('PREVIEW')
      
      setTimeout(() => {
        setGameState('PLAYING')
      }, 4000)
    } catch (error) {
      console.error("Error setting up game:", error)
      setGameState('ERROR')
    }
  }, [])

  useEffect(() => {
    fetchAndSetup()
  }, [fetchAndSetup])

  const handleCardClick = (index: number) => {
    if (gameState !== 'PLAYING') return
    if (flippedIndices.length >= 2) return
    if (flippedIndices.includes(index)) return
    
    const card = cards[index]
    if (matchedIds.includes(card.memberId)) return
    
    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)
    
    if (newFlipped.length === 2) {
      const match1 = cards[newFlipped[0]]
      const match2 = cards[newFlipped[1]]
      
      if (match1.memberId === match2.memberId) {
        // MATCH
        setMatchedIds(prev => {
          const updated = [...prev, match1.memberId]
          // Check Win Condition
          if (updated.length === cards.length / 2) {
            setTimeout(() => setGameState('WIN'), 500)
          }
          return updated
        })
        setFlippedIndices([])
      } else {
        // MISMATCH
        setHealth(prev => {
          const newHealth = prev - 1
          if (newHealth <= 0) {
            setTimeout(() => setGameState('GAME_OVER'), 500)
          }
          return newHealth
        })
        setTimeout(() => {
          setFlippedIndices([])
        }, 1000)
      }
    }
  }

  const isVisible = (index: number) => {
    if (gameState === 'PREVIEW' || gameState === 'GAME_OVER' || gameState === 'WIN') return true
    if (matchedIds.includes(cards[index].memberId)) return true
    if (flippedIndices.includes(index)) return true
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-28 pb-8 relative overflow-hidden">
      <Navbar />
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Header */}
      <div className="w-full justify-end items-center max-w-7xl mb-6 flex px-4 relative z-20">
        <div className="flex items-center gap-1.5 bg-red-50 px-4 py-2 rounded-full border border-red-100">
          <span className="text-sm font-bold text-red-600 mr-2 hidden sm:inline">Health:</span>
          {Array.from({ length: MAX_HEALTH }).map((_, idx) => (
            <Heart key={idx} className={`w-5 h-5 ${idx < health ? 'text-red-500 fill-red-500' : 'text-gray-300'} transition-colors duration-300`} />
          ))}
        </div>
      </div>

      <div className="text-center mb-6 relative z-10 w-full px-4">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Memory Match</h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto">
          Ingat posisi kartu member dan temukan pasangannya sebelum nyawamu habis!
        </p>
      </div>

      {/* Main Game Area */}
      {gameState === 'LOADING' && (
        <div className="flex flex-col items-center justify-center py-20 relative z-10">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 font-bold animate-pulse">Memuat kartu member...</p>
        </div>
      )}

      {gameState === 'ERROR' && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-3xl text-center max-w-md relative z-10">
          <h2 className="text-xl font-bold mb-2">Gagal Memuat</h2>
          <p>Dibutuhkan minimal 2 member GSA di database untuk bermain game ini.</p>
        </div>
      )}

      {(gameState === 'PREVIEW' || gameState === 'PLAYING' || gameState === 'GAME_OVER' || gameState === 'WIN') && (
        <div className="relative w-full max-w-4xl z-10 px-2 sm:px-0">
          {/* Card Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full mx-auto justify-center max-w-2xl">
            {cards.map((card, index) => {
              const photoSrc = card.photoURL ? CloudinaryPresets.memberCard(card.photoURL) : `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&background=3b82f6&color=fff`
              const topLeftIcon = `/images/asset${(index % 4) + 7}.png`
              const bottomRightIcon = `/images/asset${((index + 2) % 4) + 7}.png`

              return (
                <div 
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className="relative w-full aspect-[3/4] cursor-pointer group"
                  style={{ perspective: '1200px' }}
                >
                  <div 
                    className={`w-full h-full transition-transform duration-500 relative rounded-[20px] sm:rounded-[32px] shadow-xl ${isVisible(index) ? '[transform:rotateY(180deg)]' : ''}`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* BACK of card (Cover) - Initial State */}
                    <div 
                      className="absolute inset-0 bg-white rounded-[20px] sm:rounded-[32px] flex items-center justify-center border-[3px] sm:border-[5px] border-blue-50 shadow-xl hover:bg-blue-50/50 transition-colors"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <img src={card.backIcon} className="w-14 sm:w-20 object-contain drop-shadow-sm group-hover:scale-110 transition-transform" alt="Cover" />
                    </div>

                    {/* FRONT of card (Photo & Name) - Member Card Design */}
                    <div 
                      className={`absolute inset-0 bg-white rounded-[20px] sm:rounded-[32px] p-2 sm:p-3 border-[3px] sm:border-[5px] border-white shadow-2xl flex flex-col items-center transition-all ${
                        matchedIds.includes(card.memberId) ? 'ring-4 sm:ring-8 ring-green-400 bg-green-50' : ''
                      }`}
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {/* Decorative Corner Icons */}
                      <img src={topLeftIcon} alt="Decoration" className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-10 sm:h-10 object-contain drop-shadow-sm z-20 pointer-events-none" />
                      <img src={bottomRightIcon} alt="Decoration" className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-6 h-6 sm:w-10 sm:h-10 object-contain drop-shadow-sm z-20 pointer-events-none" />

                      <div className="w-full h-[60%] sm:h-[65%] bg-blue-50/80 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1.5 sm:mb-2 overflow-hidden relative border border-blue-100">
                        <img 
                          src={photoSrc} 
                          className="w-full h-full object-cover" 
                          alt={card.name}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center w-full px-1">
                        <span className="text-[9px] sm:text-sm font-extrabold text-gray-800 text-center leading-tight line-clamp-2 w-full">{card.name}</span>
                        <span className="hidden sm:block text-[10px] text-[#0ea5e9] font-bold text-center truncate w-full mt-0.5">{card.campus || 'GSA Member'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Overlays */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-[40px]">
              <div className="bg-white p-8 rounded-[40px] shadow-2xl border flex flex-col items-center transform scale-110 animate-in zoom-in duration-300">
                <h2 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h2>
                <p className="text-gray-600 font-medium mb-6">Yahh nyawamu habis!</p>
                <button 
                  onClick={fetchAndSetup}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" /> Main Lagi
                </button>
              </div>
            </div>
          )}

          {gameState === 'WIN' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-[40px]">
              <div className="bg-white p-8 rounded-[40px] shadow-2xl border flex flex-col items-center transform scale-110 animate-in zoom-in duration-300">
                <img src="/images/asset7.png" className="w-20 mb-4 animate-bounce" alt="Victory" />
                <h2 className="text-4xl font-black text-green-500 mb-2">KAMU MENANG!</h2>
                <p className="text-gray-600 font-medium mb-6 text-center max-w-xs">Ingatanmu luar biasa! Kamu berhasil mengenali semua member.</p>
                <button 
                  onClick={fetchAndSetup}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" /> Main Lagi
                </button>
              </div>
            </div>
          )}
          
          {gameState === 'PREVIEW' && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-pulse">
              Hafalkan posisi kartu!
            </div>
          )}
        </div>
      )}
      
      <Footer />
    </div>
  )
}
