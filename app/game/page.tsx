/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Silkscreen } from 'next/font/google'

const pixelFont = Silkscreen({ weight: ['400', '700'], subsets: ['latin'] })

const pixelOutlineStroke = {
  textShadow: '2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
}

// Constants
const GRAVITY = 0.56
const JUMP_STRENGTH = -8
const PIPE_SPEED = 3
const PIPE_SPAWN_RATE = 100 // frames
const PIPE_WIDTH = 52
const PIPE_GAP = 150
const BIRD_WIDTH = 40
const BIRD_HEIGHT = 40
const GAME_WIDTH = 400
const GAME_HEIGHT = 600
const GROUND_HEIGHT = 112

interface Pipe {
  x: number
  topHeight: number
  passed: boolean
}

export default function GamePage() {
  const { user, memberData, loading } = useAuth()
  
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'FALLING' | 'GAME_OVER'>('START')
  const [birdPos, setBirdPos] = useState(GAME_HEIGHT / 2)
  const [birdVel, setBirdVel] = useState(0)
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  
  const frameRef = useRef(0)
  const gameLoopRef = useRef<number>()

  // Audio refs
  const wingSound = useRef<HTMLAudioElement | null>(null)
  const hitSound = useRef<HTMLAudioElement | null>(null)
  const pointSound = useRef<HTMLAudioElement | null>(null)
  const dieSound = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio
    wingSound.current = new Audio('/game-assets/audio/wing.wav')
    hitSound.current = new Audio('/game-assets/audio/hit.wav')
    pointSound.current = new Audio('/game-assets/audio/point.wav')
    dieSound.current = new Audio('/game-assets/audio/die.wav')
    
    // Load high score
    const saved = localStorage.getItem('flappy_highscore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  const jump = useCallback(() => {
    if (gameState === 'START') {
      setGameState('PLAYING')
      setBirdPos(GAME_HEIGHT / 2)
      setBirdVel(JUMP_STRENGTH)
      setPipes([])
      setScore(0)
      frameRef.current = 0
      wingSound.current?.play().catch(() => {})
    } else if (gameState === 'PLAYING') {
      setBirdVel(JUMP_STRENGTH)
      if (wingSound.current) wingSound.current.currentTime = 0
      wingSound.current?.play().catch(() => {})
    } else if (gameState === 'GAME_OVER') {
      setGameState('START')
    }
  }, [gameState])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [jump])

  const die = useCallback(() => {
    setGameState('FALLING')
    hitSound.current?.play().catch(() => {})
  }, [])

  const gameOver = useCallback(() => {
    setGameState('GAME_OVER')
    setTimeout(() => dieSound.current?.play().catch(() => {}), 100)
    
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('flappy_highscore', score.toString())
    }
  }, [score, highScore])

  useEffect(() => {
    if (gameState !== 'PLAYING' && gameState !== 'FALLING') return

    const gameLoop = () => {
      if (gameState === 'PLAYING') {
        frameRef.current += 1
      }

      // Physics
      const nextVel = birdVel + GRAVITY
      setBirdVel(nextVel)
      setBirdPos((prev) => {
        const newPos = prev + birdVel
        // Ground collision
        if (newPos >= GAME_HEIGHT - GROUND_HEIGHT - BIRD_HEIGHT) {
          if (gameState === 'PLAYING' || gameState === 'FALLING') {
            hitSound.current?.play().catch(() => {})
            gameOver()
          }
          return GAME_HEIGHT - GROUND_HEIGHT - BIRD_HEIGHT
        }
        // Ceiling collision
        if (newPos <= 0) {
          if (gameState === 'PLAYING') {
             die()
          }
          return 0
        }
        return newPos
      })

      // Pipes
      if (gameState === 'PLAYING') {
        setPipes((prevPipes) => {
          let newPipes = prevPipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          
          // Remove off-screen pipes
          newPipes = newPipes.filter(pipe => pipe.x + PIPE_WIDTH > 0)

          // Spawn new pipe
          if (frameRef.current % PIPE_SPAWN_RATE === 0) {
            const minPipeHeight = 50
            const maxPipeHeight = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - minPipeHeight
            const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight
            newPipes.push({ x: GAME_WIDTH, topHeight, passed: false })
          }

        // Collision and Scoring
        newPipes.forEach(pipe => {
          // Check collision
          const birdLeft = 50
          const birdRight = birdLeft + BIRD_WIDTH
          const birdTop = birdPos
          const birdBottom = birdPos + BIRD_HEIGHT

          const pipeLeft = pipe.x
          const pipeRight = pipe.x + PIPE_WIDTH
          
          const topPipeBottom = pipe.topHeight
          const bottomPipeTop = pipe.topHeight + PIPE_GAP

          if (
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            (birdTop < topPipeBottom || birdBottom > bottomPipeTop)
          ) {
            die()
          }

          // Score
          if (!pipe.passed && pipeLeft + PIPE_WIDTH < birdLeft) {
            pipe.passed = true
            setScore(s => s + 1)
            pointSound.current?.play().catch(() => {})
          }
        })

        return newPipes
      })
    }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, birdPos, birdVel, gameOver, die])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-28 pb-8 relative">
      <Navbar />
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="w-full justify-end items-center max-w-lg mb-4 flex px-4">
        {/* Profile Card */}
        <div className="flex flex-col items-end gap-1">
          <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center gap-2 border border-blue-100">
            <span>{loading ? 'Memuat Profil...' : (memberData?.name || user?.displayName || 'Tamu (Belum Login)')}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400' : (user ? 'bg-green-500' : 'bg-red-500')} animate-pulse`}></span>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-white p-2 sm:p-4 rounded-[40px] shadow-2xl border-4 border-gray-100">
        <div 
          className="relative overflow-hidden cursor-pointer rounded-3xl border-4 border-gray-800"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT, maxWidth: '100%', maxHeight: '600px' }}
          onClick={jump}
        >
          {/* Game Background */}
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              backgroundImage: 'url(/game-assets/sprites/background-day.png)',
              backgroundSize: 'auto 100%',
              backgroundRepeat: 'repeat-x',
              backgroundPosition: `${-(frameRef.current * 0.5)}px 0`
            }}
          />

          {/* Pipes */}
          {pipes.map((pipe, i) => (
            <div key={i}>
              {/* Top Pipe */}
              <div 
                className="absolute bg-no-repeat"
                style={{
                  left: pipe.x,
                  top: pipe.topHeight - 320, // 320 is typical pipe image height
                  width: PIPE_WIDTH,
                  height: 320,
                  backgroundImage: 'url(/game-assets/sprites/pipe-green.png)',
                  transform: 'scaleY(-1)' // Flip vertically
                }}
              />
              {/* Bottom Pipe */}
              <div 
                className="absolute bg-no-repeat"
                style={{
                  left: pipe.x,
                  top: pipe.topHeight + PIPE_GAP,
                  width: PIPE_WIDTH,
                  height: 320,
                  backgroundImage: 'url(/game-assets/sprites/pipe-green.png)'
                }}
              />
            </div>
          ))}

          {/* Ground */}
          <div 
            className="absolute w-full z-20"
            style={{ 
              top: GAME_HEIGHT - GROUND_HEIGHT,
              height: GROUND_HEIGHT,
              backgroundImage: 'url(/game-assets/sprites/base.png)',
              backgroundSize: `auto ${GROUND_HEIGHT}px`,
              backgroundRepeat: 'repeat-x',
              backgroundPosition: `${-(frameRef.current * PIPE_SPEED)}px 0`
            }}
          />

          {/* Bird */}
          <div 
            className="absolute z-30 transition-transform duration-75"
            style={{
              left: 50, // Fixed horizontal position
              top: birdPos,
              width: BIRD_WIDTH,
              height: BIRD_HEIGHT,
              backgroundImage: 'url(/game-assets/sprites/dino.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              transform: `rotate(${gameState === 'FALLING' || gameState === 'GAME_OVER' ? 90 : Math.min(Math.max(birdVel * 3, -25), 90)}deg)` // Rotate based on velocity
            }}
          />

          {/* In-Game Score */}
          {(gameState === 'PLAYING' || gameState === 'START') && (
            <div className="absolute top-10 w-full text-center z-50 pointer-events-none">
              <span className={`text-6xl text-white ${pixelFont.className}`} style={pixelOutlineStroke}>
                {score}
              </span>
            </div>
          )}

          {/* Start Screen */}
          {gameState === 'START' && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <h1 className={`text-4xl text-white mb-6 text-center leading-relaxed ${pixelFont.className}`} style={pixelOutlineStroke}>
                FLAPPY<br/>CLOUD
              </h1>
              <p className={`text-2xl text-green-400 mb-10 animate-pulse ${pixelFont.className}`} style={pixelOutlineStroke}>
                GET READY!
              </p>
              <button 
                className={`bg-blue-500 hover:bg-blue-400 text-white uppercase font-bold text-sm tracking-wider px-8 py-4 rounded-full border-4 border-white shadow-[0_4px_0_rgb(37,99,235)] active:shadow-none active:translate-y-1 transition-all ${pixelFont.className}`}
                style={pixelOutlineStroke}
                onClick={(e) => { e.stopPropagation(); jump() }}
              >
                MULAI MAIN
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <img src="/game-assets/sprites/gameover.png" alt="Game Over" className="mb-6 w-48 drop-shadow-lg" />
              <div className="bg-[#ded895] p-6 rounded-xl border-4 border-[#543847] shadow-xl text-center mb-6 w-64 transform scale-110">
                <p className={`text-white text-xl mb-3 font-bold ${pixelFont.className}`} style={pixelOutlineStroke}>SCORE</p>
                <p className={`text-4xl text-white mb-5 ${pixelFont.className}`} style={pixelOutlineStroke}>{score}</p>
                
                <p className={`text-white text-xl mb-3 font-bold ${pixelFont.className}`} style={pixelOutlineStroke}>BEST</p>
                <p className={`text-4xl text-white ${pixelFont.className}`} style={pixelOutlineStroke}>{highScore}</p>
              </div>
              <button 
                className={`bg-green-500 hover:bg-green-400 text-white uppercase text-base font-bold tracking-wider px-8 py-4 rounded-full border-4 border-white shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 transition-all ${pixelFont.className}`}
                style={pixelOutlineStroke}
                onClick={(e) => { e.stopPropagation(); jump() }}
              >
                MAIN LAGI
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile controls hint */}
        <p className="text-gray-400 text-center mt-3 font-semibold text-sm hidden sm:block">
          Gunakan <kbd className="bg-gray-800 px-2 py-1 rounded text-white mx-1 border border-gray-600">Spasi</kbd> atau <kbd className="bg-gray-800 px-2 py-1 rounded text-white mx-1 border border-gray-600">↑</kbd> untuk lompat
        </p>
      </div>
      <Footer />
    </div>
  )
}
