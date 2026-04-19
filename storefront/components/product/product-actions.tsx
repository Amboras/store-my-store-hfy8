'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Minus, Plus, Check, Loader2, Flame, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import ProductPrice, { type VariantExtension } from './product-price'
import { formatPrice } from '@/lib/utils/format-price'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'
import type { Product } from '@/types'

interface ProductActionsProps {
  product: Product
  variantExtensions?: Record<string, VariantExtension>
}

interface VariantOption {
  option_id?: string
  option?: { id: string }
  value: string
}

interface ProductVariantWithPrice {
  id: string
  title?: string
  options?: VariantOption[]
  calculated_price?: {
    calculated_amount?: number
    currency_code?: string
  } | number
  [key: string]: unknown
}

interface ProductOptionValue {
  id?: string
  value: string
}

interface ProductOptionWithValues {
  id: string
  title: string
  values?: (string | ProductOptionValue)[]
}

// Helper: extract price amount from calculated_price object
function getVariantPriceAmount(variant: ProductVariantWithPrice | undefined): number | null {
  const cp = variant?.calculated_price
  if (!cp) return null
  return typeof cp === 'number' ? cp : cp.calculated_amount ?? null
}

function getVariantCurrency(variant: ProductVariantWithPrice | undefined): string {
  const cp = variant?.calculated_price
  if (!cp || typeof cp === 'number') return 'usd'
  return cp.currency_code || 'usd'
}

// Parse unit count from a pack value string, e.g. "2-Pack · Save 15%" -> 2
function parsePackUnits(value: string): number {
  const match = value.match(/(\d+)\s*-?\s*pack/i)
  if (match) return parseInt(match[1], 10)
  return 1
}

export default function ProductActions({ product, variantExtensions }: ProductActionsProps) {
  const variants = useMemo(
    () => (product.variants || []) as unknown as ProductVariantWithPrice[],
    [product.variants],
  )
  const options = useMemo(() => product.options || [], [product.options])

  // Track selected value per option
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    const firstVariant = variants[0]
    if (firstVariant?.options) {
      for (const opt of firstVariant.options) {
        const optionId = opt.option_id || opt.option?.id
        if (optionId && opt.value) {
          defaults[optionId] = opt.value
        }
      }
    }
    return defaults
  })

  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem, isAddingItem } = useCart()

  // Find variant matching all selected options
  const selectedVariant = useMemo(() => {
    if (variants.length <= 1) return variants[0]
    return variants.find((v: ProductVariantWithPrice) => {
      if (!v.options) return false
      return v.options.every((opt: VariantOption) => {
        const optionId = opt.option_id || opt.option?.id
        if (!optionId) return false
        return selectedOptions[optionId] === opt.value
      })
    }) || variants[0]
  }, [variants, selectedOptions])

  const ext = selectedVariant?.id ? variantExtensions?.[selectedVariant.id] : null
  const currentPriceCents = getVariantPriceAmount(selectedVariant)
  const currency = getVariantCurrency(selectedVariant)

  const allowBackorder = ext?.allow_backorder ?? false
  const inventoryQuantity = ext?.inventory_quantity
  const isOutOfStock = !allowBackorder && inventoryQuantity != null && inventoryQuantity <= 0
  const isLowStock = inventoryQuantity != null && inventoryQuantity > 0 && inventoryQuantity < 15

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
    setQuantity(1)
  }

  const handleAddToCart = () => {
    if (!selectedVariant?.id || isOutOfStock) return

    addItem(
      { variantId: selectedVariant.id, quantity },
      {
        onSuccess: () => {
          setJustAdded(true)
          toast.success('Added to bag')
          const metaValue = toMetaCurrencyValue(currentPriceCents)
          trackAddToCart(product?.id || '', selectedVariant.id, quantity, currentPriceCents ?? undefined)
          trackMetaEvent('AddToCart', {
            content_ids: [selectedVariant.id],
            content_type: 'product',
            content_name: product?.title,
            value: metaValue,
            currency,
            contents: [{ id: selectedVariant.id, quantity, item_price: metaValue }],
            num_items: quantity,
          })
          setTimeout(() => setJustAdded(false), 2000)
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to add to bag')
        },
      }
    )
  }

  const hasMultipleVariants = variants.length > 1

  return (
    <div className="space-y-6">
      {/* Price */}
      <ProductPrice
        amount={currentPriceCents}
        currency={currency}
        compareAtPrice={ext?.compare_at_price}
        soldOut={isOutOfStock}
        size="detail"
      />

      {/* Option Selectors */}
      {hasMultipleVariants && options.map((option: ProductOptionWithValues) => {
        const values = (option.values || []).map((v: string | ProductOptionValue) =>
          typeof v === 'string' ? v : v.value
        ).filter(Boolean) as string[]

        if (values.length <= 1 && (values[0] === 'One Size' || values[0] === 'Default')) {
          return null
        }

        const optionId = option.id
        const selectedValue = selectedOptions[optionId]
        const isPackOption = option.title.trim().toLowerCase() === 'pack'

        // ===== Pack / Bundle selector — rich cards =====
        if (isPackOption) {
          return (
            <div key={optionId}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-widest font-semibold">
                  Choose your bundle
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] text-accent font-semibold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Best value
                </span>
              </div>

              <div className="space-y-2.5">
                {values.map((value, idx) => {
                  const isSelected = selectedValue === value
                  const packVariant = variants.find((v) =>
                    v.options?.some(
                      (o) =>
                        (o.option_id === optionId || o.option?.id === optionId) &&
                        o.value === value,
                    ),
                  )
                  const packPriceCents = getVariantPriceAmount(packVariant)
                  const packCurrency = getVariantCurrency(packVariant)
                  const packExt = packVariant?.id ? variantExtensions?.[packVariant.id] : null
                  const packCompare = packExt?.compare_at_price
                  const units = parsePackUnits(value)
                  const perUnitCents = packPriceCents != null ? Math.round(packPriceCents / units) : null

                  const isAvailable = packExt?.allow_backorder
                    ? true
                    : packExt?.inventory_quantity == null || packExt.inventory_quantity > 0

                  // Savings vs. compare price
                  const savingsPct =
                    packCompare && packPriceCents
                      ? Math.round(((packCompare - packPriceCents) / packCompare) * 100)
                      : null

                  // Badge logic
                  let badge: { label: string; icon?: typeof Flame } | null = null
                  if (idx === values.length - 1 && values.length >= 3) {
                    badge = { label: 'Best value', icon: Sparkles }
                  } else if (idx === 1 && values.length >= 2) {
                    badge = { label: 'Most popular', icon: Flame }
                  }

                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(optionId, value)}
                      disabled={!isAvailable}
                      className={`relative w-full text-left rounded-lg border-2 p-4 transition-all ${
                        isSelected
                          ? 'border-foreground bg-foreground/[0.03] shadow-sm'
                          : isAvailable
                          ? 'border-border hover:border-foreground/50'
                          : 'border-border opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {badge && (
                        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {badge.icon ? <badge.icon className="h-3 w-3" /> : null}
                          {badge.label}
                        </span>
                      )}
                      <div className="flex items-center gap-4">
                        {/* Radio indicator */}
                        <span
                          className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-foreground bg-foreground'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-background" />
                          )}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{value}</span>
                            {savingsPct != null && savingsPct > 0 && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
                                Save {savingsPct}%
                              </span>
                            )}
                          </div>
                          {perUnitCents != null && units > 1 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatPrice(perUnitCents, packCurrency)} each
                            </p>
                          )}
                        </div>

                        <div className="flex-shrink-0 text-right">
                          {packCompare && packPriceCents && packCompare > packPriceCents && (
                            <p className="text-xs text-muted-foreground line-through leading-none">
                              {formatPrice(packCompare, packCurrency)}
                            </p>
                          )}
                          {packPriceCents != null && (
                            <p className="font-heading text-lg font-bold leading-tight mt-0.5">
                              {formatPrice(packPriceCents, packCurrency)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }

        // ===== Standard option selector =====
        return (
          <div key={optionId}>
            <h3 className="text-xs uppercase tracking-widest font-semibold mb-3">
              {option.title}
              {selectedValue && (
                <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground">
                  — {selectedValue}
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = selectedValue === value
                const isAvailable = variants.some((v: ProductVariantWithPrice) => {
                  const hasValue = v.options?.some(
                    (o: VariantOption) =>
                      (o.option_id === optionId || o.option?.id === optionId) && o.value === value,
                  )
                  if (!hasValue) return false
                  const vExt = variantExtensions?.[v.id]
                  if (!vExt) return true
                  if (vExt.allow_backorder) return true
                  return vExt.inventory_quantity == null || vExt.inventory_quantity > 0
                })

                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(optionId, value)}
                    disabled={!isAvailable}
                    className={`min-w-[48px] px-4 py-2.5 text-sm border transition-all ${
                      isSelected
                        ? 'border-foreground bg-foreground text-background'
                        : isAvailable
                        ? 'border-border hover:border-foreground'
                        : 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Low Stock Warning */}
      {isLowStock && (
        <div className="flex items-center gap-2 rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm">
          <Flame className="h-4 w-4 text-accent flex-shrink-0" strokeWidth={2} />
          <p className="text-foreground">
            <span className="font-semibold">Only {inventoryQuantity} left</span>
            <span className="text-muted-foreground"> · selling fast at this price</span>
          </p>
        </div>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex gap-3">
        <div className="flex items-center border rounded-sm">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-muted transition-colors"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium tabular-nums">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 hover:bg-muted transition-colors"
            disabled={isOutOfStock || (!allowBackorder && inventoryQuantity != null && quantity >= inventoryQuantity)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingItem}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-wide transition-all rounded-sm ${
            isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : justAdded
              ? 'bg-green-700 text-white'
              : 'bg-foreground text-background hover:opacity-90'
          }`}
        >
          {isAddingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : isOutOfStock ? (
            'Sold Out'
          ) : (
            'Add to Bag'
          )}
        </button>
      </div>
    </div>
  )
}
