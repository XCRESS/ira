'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useSmoothScroll() {
  useEffect(() => {
    // Smooth scroll configuration
    gsap.to(window, {
      duration: 0.1,
      scrollTo: { y: 0, autoKill: false },
      ease: 'power2.out'
    })

    // Refresh ScrollTrigger on resize
    const handleResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])
}
