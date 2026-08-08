"use client"

import { Copy, Phone } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"

interface PhoneItemProps {
  phone: string
}

const PhoneItem = ({ phone }: PhoneItemProps) => {
  const handleCopyPhoneClick = async () => {
    try {
      await navigator.clipboard.writeText(phone)
      toast.success("Telefone copiado.")
    } catch {
      toast.error("Não foi possível copiar o telefone.")
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2.5">
        <Phone size={16} className="shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate text-sm">{phone}</span>
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyPhoneClick}
        aria-label={`Copiar telefone ${phone}`}
      >
        <Copy size={14} />
        Copiar
      </Button>
    </div>
  )
}

export default PhoneItem
