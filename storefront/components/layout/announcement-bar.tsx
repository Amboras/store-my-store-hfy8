'use client'

import { useState } from 'react'
import { X, Zap, Truck, ShieldCheck } from 'lucide-react'

const MESSAGES = [
  { icon: Zap, text: 'Launch Week — up to 30% off select gadgets' },
  { icon: Truck, text: 'Free EU shipping on orders over €75' },
  { icon: ShieldCheck, text: '2-year warranty · 30-day free returns' },
]

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-foreground text-primary-foreground overflow-hidden">
      <div className="container-custom flex items-center justify-center py-2 text-xs sm:text-sm tracking-wide">
        <div className="flex items-center gap-10 overflow-hidden">
          <div className="flex items-center gap-10 whitespace-nowrap animate-marquee">
            {[...MESSAGES, ...MESSAGES, ...MESSAGES].map((m, i) => {
              const Icon = m.icon
              return (
                <span key={i} className="inline-flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
                  <span>{m.text}</span>
                  <span className="opacity-30 px-2">•</span>
                </span>
              )
            })}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
