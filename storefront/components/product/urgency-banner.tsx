'use client'

import { useEffect, useState } from 'react'
import { Clock, Flame } from 'lucide-react'

interface UrgencyBannerProps {
  /** Total inventory across all variants */
  totalStock?: number | null
  /** Optional sale label (e.g. "Launch Week") */
  saleLabel?: string
}

// Countdown to midnight — a daily-resetting urgency cue.
function getMidnightTarget(): number {
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
  return tomorrow.getTime()
}

function formatTimeLeft(ms: number): { h: string; m: string; s: string } {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return { h: pad(h), m: pad(m), s: pad(s) }
}

export default function UrgencyBanner({ totalStock, saleLabel = 'Launch Week' }: UrgencyBannerProps) {
  const [target] = useState<number>(() => getMidnightTarget())
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const { h, m, s } = formatTimeLeft(target - now)
  const isLowStock = totalStock != null && totalStock > 0 && totalStock < 50

  return (
    <div className="rounded-lg border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-foreground text-background">
            <Flame className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">
              {saleLabel} — Ends Tonight
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLowStock
                ? `Only ${totalStock} units left in this drop`
                : 'Free EU shipping on this order'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex items-center gap-1 font-mono text-sm font-bold tabular-nums">
            <span className="inline-flex min-w-[2.25rem] justify-center rounded bg-foreground text-background px-1.5 py-1">{h}</span>
            <span className="text-muted-foreground">:</span>
            <span className="inline-flex min-w-[2.25rem] justify-center rounded bg-foreground text-background px-1.5 py-1">{m}</span>
            <span className="text-muted-foreground">:</span>
            <span className="inline-flex min-w-[2.25rem] justify-center rounded bg-foreground text-background px-1.5 py-1">{s}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
