"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import BarbershopLogo from "@/app/_components/brand/barbershop-logo"

interface Shop {
  id: string
  name: string
  slug: string
  logoKey: string
  accentColor: string
}

interface ShopSwitcherProps {
  shops: Shop[]
  current: Shop
}

/**
 * Troca a barbearia em foco no painel. O valor viaja na query string para que
 * a seleção sobreviva à navegação entre as seções e possa ser compartilhada.
 */
const ShopSwitcher = ({ shops, current }: ShopSwitcherProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("shop", slug)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ boxShadow: `inset 0 0 0 1px ${current.accentColor}40` }}
      >
        <BarbershopLogo
          logoKey={current.logoKey}
          accentColor={current.accentColor}
          className="h-5 w-5"
        />
      </span>

      <label className="sr-only" htmlFor="shop-switcher">
        Barbearia em exibição
      </label>
      <select
        id="shop-switcher"
        value={current.slug}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 rounded-md border border-white/10 bg-transparent px-2.5 text-sm font-medium outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {shops.map((shop) => (
          <option key={shop.id} value={shop.slug} className="bg-card">
            {shop.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ShopSwitcher
