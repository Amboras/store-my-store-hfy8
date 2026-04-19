import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Lock,
  BadgeCheck,
  Package,
  Headphones,
  Star,
} from 'lucide-react'
import ProductActions from '@/components/product/product-actions'
import ProductAccordion from '@/components/product/product-accordion'
import UrgencyBanner from '@/components/product/urgency-banner'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getVariantExtensions(productId: string): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const variantExtensions = await getVariantExtensions(product.id)

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter((img: { url: string }) => img.url !== product.thumbnail),
  ]

  const displayImages = allImages.length > 0
    ? allImages
    : [{ url: getProductPlaceholder(product.id) }]

  // Total stock across variants (for urgency banner)
  const totalStock = Object.values(variantExtensions).reduce<number>(
    (sum, ext) => sum + (ext?.inventory_quantity ?? 0),
    0,
  ) || null

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-lg">
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
                In stock
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: { url: string }, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] overflow-hidden bg-muted rounded-md"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Ratings */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
                ))}
              </div>
              <span className="font-semibold">4.8</span>
              <span className="text-muted-foreground">· 2,410 verified reviews</span>
            </div>

            {/* Title & Subtitle */}
            <div>
              {product.subtitle && (
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  {product.subtitle}
                </p>
              )}
              <h1 className="text-h2 font-heading font-bold leading-tight">{product.title}</h1>
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={product.variants?.[0]?.id || null}
              currency={product.variants?.[0]?.calculated_price?.currency_code || 'usd'}
              value={product.variants?.[0]?.calculated_price?.calculated_amount ?? null}
            />

            {/* Urgency Banner */}
            <UrgencyBanner totalStock={totalStock} saleLabel="Launch Week" />

            {/* Variant Selector + Price + Add to Cart */}
            <ProductActions product={product} variantExtensions={variantExtensions} />

            {/* Guarantee callout */}
            <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <ShieldCheck className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-semibold">30-day money-back guarantee</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Try it at home. If you&apos;re not in love, send it back for a full refund — we cover the return shipping.
                </p>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex flex-col items-center gap-1.5 rounded-md border p-3 text-center">
                <Truck className="h-4 w-4" strokeWidth={1.75} />
                <p className="text-[11px] font-semibold">Free EU Shipping</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Orders €75+</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-md border p-3 text-center">
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                <p className="text-[11px] font-semibold">30-Day Returns</p>
                <p className="text-[10px] text-muted-foreground leading-tight">No questions</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-md border p-3 text-center">
                <BadgeCheck className="h-4 w-4" strokeWidth={1.75} />
                <p className="text-[11px] font-semibold">2-Yr Warranty</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Covered</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-md border p-3 text-center">
                <Lock className="h-4 w-4" strokeWidth={1.75} />
                <p className="text-[11px] font-semibold">Secure Checkout</p>
                <p className="text-[10px] text-muted-foreground leading-tight">SSL encrypted</p>
              </div>
            </div>

            {/* Payment methods */}
            <div className="flex items-center justify-between border rounded-md px-4 py-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Guaranteed safe checkout
              </span>
              <span className="font-medium">Visa · Mastercard · Amex · PayPal · Apple Pay</span>
            </div>

            {/* Accordion Sections */}
            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>

      {/* Value-prop strip under the fold */}
      <section className="border-t bg-muted/30">
        <div className="container-custom py-section-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold">Ships in 24h</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                From our EU warehouse. Tracked delivery included.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold">2-year warranty</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Any defect, any reason. We&apos;ll replace it.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Headphones className="h-5 w-5 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold">Human support</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real people, replying in under 4 hours — 7 days a week.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BadgeCheck className="h-5 w-5 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold">Built to last</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aircraft-grade aluminum, tested to 50,000 cycles.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
