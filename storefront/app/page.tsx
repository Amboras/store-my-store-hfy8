'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Cpu,
  BatteryCharging,
  Wifi,
  Star,
} from 'lucide-react'
import CollectionSection from '@/components/marketing/collection-section'
import { useCollections } from '@/hooks/use-collections'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1625961332771-3f40b0e2bdcf?w=1600&q=80'
const LIFESTYLE_IMAGE =
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1600&q=80'
const DESK_IMAGE =
  'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=1600&q=80'

const STATS = [
  { value: '150K+', label: 'Gadgets shipped' },
  { value: '4.8/5', label: 'Average rating' },
  { value: '38', label: 'Countries' },
  { value: '2-yr', label: 'Warranty' },
]

const FEATURE_ICONS = [
  {
    icon: BatteryCharging,
    title: 'Fast-charge everything',
    desc: 'USB-C PD, MagSafe & Qi — powered up to 30W on every port.',
  },
  {
    icon: Cpu,
    title: 'Smart by design',
    desc: 'App-free, plug-and-play. Your gadgets just work — instantly.',
  },
  {
    icon: Wifi,
    title: 'Built to last',
    desc: 'Aircraft-grade alloys, tested to 50,000 cycles. Warrantied for 2 years.',
  },
]

export default function HomePage() {
  const { data: collections, isLoading } = useCollections()
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    trackMetaEvent('Lead', {
      content_name: 'newsletter_signup',
      status: 'submitted',
    })
  }

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background to-muted/40">
        {/* subtle grid + accent glow */}
        <div
          aria-hidden
          className="absolute inset-0 bg-grid opacity-[0.25] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl"
        />

        <div className="container-custom relative grid lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-14 pb-16 lg:pt-24 lg:pb-24">
          {/* Left copy */}
          <div className="lg:col-span-6 space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 backdrop-blur px-3 py-1.5 text-xs font-medium tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-pulse-dot" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              New drop — Launch Week is live
            </div>

            <h1 className="text-display font-heading font-bold text-balance leading-[1.02]">
              Everyday tech,{' '}
              <span className="relative inline-block">
                <span className="relative z-10">elevated.</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 h-3 bg-accent/40 -skew-x-6"
                />
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Smart gadgets engineered to make daily life easier — cleaner desks,
              faster charging, sharper focus. No clutter. No friction. Just tech
              that quietly works.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity rounded-sm"
                prefetch={true}
              >
                Shop gadgets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-foreground/20 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide hover:border-foreground hover:bg-foreground hover:text-background transition-all rounded-sm"
                prefetch={true}
              >
                Our story
              </Link>
            </div>

            {/* Mini trust strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground">
              <div className="inline-flex items-center gap-1.5">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-accent text-accent"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span className="font-semibold text-foreground">4.8/5</span>
                <span>· 12,400+ reviews</span>
              </div>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> 2-yr warranty
              </span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Free EU shipping €75+
              </span>
            </div>
          </div>

          {/* Right visual */}
          <div className="lg:col-span-6 relative animate-fade-in">
            <div className="relative aspect-[4/5] lg:aspect-[5/6] overflow-hidden rounded-2xl bg-muted glow-accent">
              <Image
                src={HERO_IMAGE}
                alt="PULSE — modern gadgets for daily life"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {/* Floating spec card */}
              <div className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 flex items-center gap-3 rounded-xl border border-white/20 bg-background/85 backdrop-blur px-4 py-3 shadow-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                  <Zap className="h-4 w-4" strokeWidth={2.25} />
                </div>
                <div className="pr-1">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    Best-seller
                  </p>
                  <p className="text-sm font-semibold leading-tight">
                    Nova 3-in-1 Charger
                  </p>
                </div>
              </div>

              {/* Floating pill */}
              <div className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full border border-white/20 bg-background/85 backdrop-blur px-3 py-1.5 text-[11px] font-medium tracking-wide">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
                  In stock · ships today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t">
          <div className="container-custom grid grid-cols-2 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`py-6 px-2 text-center ${
                  i < STATS.length - 1 ? 'sm:border-r' : ''
                } ${i < 2 ? 'border-b sm:border-b-0' : ''} ${
                  i === 0 ? 'border-r' : i === 2 ? 'border-r sm:border-r' : ''
                }`}
              >
                <p className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                  {s.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FEATURE ICONS ============================ */}
      <section className="py-section-sm border-b">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURE_ICONS.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================ COLLECTIONS ============================ */}
      {isLoading ? (
        <section className="py-section">
          <div className="container-custom">
            <div className="animate-pulse space-y-4 text-center">
              <div className="h-3 w-20 bg-muted rounded mx-auto" />
              <div className="h-8 w-64 bg-muted rounded mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-muted rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      ) : collections && collections.length > 0 ? (
        <>
          {collections.map(
            (
              collection: {
                id: string
                handle: string
                title: string
                metadata?: Record<string, unknown>
              },
              index: number,
            ) => (
              <CollectionSection
                key={collection.id}
                collection={collection}
                alternate={index % 2 === 1}
              />
            ),
          )}
        </>
      ) : null}

      {/* ============================ EDITORIAL ============================ */}
      <section className="py-section bg-muted/30 border-y">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted order-2 lg:order-1">
              <Image
                src={LIFESTYLE_IMAGE}
                alt="Gadgets in daily life"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-background/85 backdrop-blur px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Featured in
                </p>
                <p className="text-sm font-semibold leading-tight mt-0.5">
                  The Verge · Wirecutter · GQ
                </p>
              </div>
            </div>
            <div className="space-y-6 lg:max-w-md order-1 lg:order-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                The PULSE philosophy
              </p>
              <h2 className="text-h2 font-heading font-bold leading-tight">
                Tech should disappear into your life — not take it over.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We obsess over the details most brands skip: heat dissipation,
                cable memory, the click of a button. The result is a collection
                of gadgets that replace five messy ones — designed to be seen,
                and then quickly forgotten.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide link-underline pb-0.5"
                prefetch={true}
              >
                Read our story
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ LIFESTYLE CTA ============================ */}
      <section className="py-section">
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-2xl bg-foreground text-background">
            <Image
              src={DESK_IMAGE}
              alt="Minimal tech desk setup"
              fill
              sizes="100vw"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 sm:p-12 lg:p-16 min-h-[360px]">
              <div className="space-y-5 max-w-md">
                <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">
                  Desk Essentials Bundle
                </p>
                <h2 className="text-h2 font-heading font-bold leading-tight">
                  Replace 5 cables with one setup.
                </h2>
                <p className="text-sm text-background/70 leading-relaxed">
                  The Desk Essentials Bundle pairs our Nova 3-in-1 Charger with
                  the LumaDesk Smart Lamp — a complete, clutter-free workspace
                  for under €150.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity rounded-sm"
                    prefetch={true}
                  >
                    Build your bundle
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ TRUST STRIP ============================ */}
      <section className="py-section-sm border-y bg-muted/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Truck className="h-6 w-6 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">Free EU Shipping</p>
                <p className="text-xs text-muted-foreground">Orders over €75</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <RotateCcw className="h-6 w-6 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">30-Day Returns</p>
                <p className="text-xs text-muted-foreground">No questions asked</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <ShieldCheck className="h-6 w-6 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">2-Year Warranty</p>
                <p className="text-xs text-muted-foreground">On every gadget</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-end">
              <Zap className="h-6 w-6 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">Ships in 24h</p>
                <p className="text-xs text-muted-foreground">From EU warehouse</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ NEWSLETTER ============================ */}
      <section className="py-section">
        <div className="container-custom max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">
            Drops & discounts
          </p>
          <h2 className="text-h2 font-heading font-bold mt-3">
            Get 10% off your first gadget
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join 40,000+ subscribers. New drops, early-access launches, and the
            occasional restock alert — no spam.
          </p>
          <form className="mt-8 flex gap-2" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 border border-border bg-background rounded-sm px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="bg-foreground text-background px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity whitespace-nowrap rounded-sm"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Code drops to your inbox instantly. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </>
  )
}
