"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock3 } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import BookingFlow, { type FlowBarber, type FlowService } from "./booking-flow"
import { formatCurrency, formatDuration } from "@/app/_lib/utils"

interface ServiceItemProps {
  service: FlowService & { imageUrl: string }
  barbers: FlowBarber[]
  barbershopName: string
  accentColor: string
}

const ServiceItem = ({
  service,
  barbers,
  barbershopName,
  accentColor,
}: ServiceItemProps) => {
  const { data } = useSession()
  const [signInOpen, setSignInOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleBookClick = () => {
    if (data?.user) return setSheetOpen(true)
    setSignInOpen(true)
  }

  return (
    <>
      <article className="surface surface-hover flex gap-3 rounded-lg p-3 sm:gap-4 sm:p-4">
        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-md sm:h-[104px] sm:w-[104px]">
          <Image
            alt=""
            src={service.imageUrl}
            fill
            sizes="104px"
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-display font-bold leading-tight">
            {service.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
            {service.description}
          </p>

          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-muted-foreground">
            <Clock3 size={11} />
            {formatDuration(service.durationMinutes)}
          </span>

          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <span className="font-display text-base font-bold text-primary">
              {formatCurrency(service.price)}
            </span>
            <Button size="sm" onClick={handleBookClick}>
              Agendar
              <span className="sr-only"> {service.name}</span>
            </Button>
          </div>
        </div>
      </article>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-white/[0.06] p-5">
            <SheetTitle className="text-left font-display">
              Agendar {service.name}
            </SheetTitle>
          </SheetHeader>

          <div className="min-h-0 flex-1 pt-5">
            <BookingFlow
              service={service}
              barbers={barbers}
              barbershopName={barbershopName}
              accentColor={accentColor}
              onDone={() => setSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="w-[90%] max-w-sm">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
