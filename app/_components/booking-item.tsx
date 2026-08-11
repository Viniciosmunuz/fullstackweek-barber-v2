"use client"

import { useState } from "react"
import Image from "next/image"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import PhoneItem from "./phone-item"
import BookingSummary from "./booking-summary"
import BarbershopLogo from "./brand/barbershop-logo"
import { deleteBooking } from "../_actions/delete-booking"
import { formatCurrency } from "@/app/_lib/utils"

/**
 * Formato serializado do agendamento. Definido à mão em vez de
 * `Prisma.BookingGetPayload` porque `price` chega como número (o Decimal é
 * convertido no servidor antes de cruzar para o cliente).
 */
export interface BookingItemData {
  id: string
  date: string | Date
  barber: { name: string; specialty: string } | null
  service: {
    name: string
    price: number
    durationMinutes: number
    barbershop: {
      name: string
      address: string
      city: string
      phones: string[]
      logoKey: string
      logoUrl: string | null
      accentColor: string
    }
  }
}

interface BookingItemProps {
  booking: BookingItemData
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const { barbershop } = booking.service
  const date = new Date(booking.date)
  const isConfirmed = isFuture(date)

  const handleCancelBooking = async () => {
    setCancelling(true)
    try {
      await deleteBooking(booking.id)
      setIsSheetOpen(false)
      toast.success("Agendamento cancelado.")
    } catch (error) {
      console.error(error)
      toast.error("Não foi possível cancelar. Tente novamente.")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="surface surface-hover flex w-full min-w-[280px] items-stretch overflow-hidden rounded-lg text-left"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
            <Badge
              className="w-fit"
              variant={isConfirmed ? "default" : "secondary"}
            >
              {isConfirmed ? "Confirmado" : "Concluído"}
            </Badge>

            <h3 className="truncate font-display font-bold">
              {booking.service.name}
            </h3>

            <div className="flex items-center gap-2">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                style={{
                  boxShadow: `inset 0 0 0 1px ${barbershop.accentColor}40`,
                }}
              >
                <BarbershopLogo
                  logoKey={barbershop.logoKey}
                  logoUrl={barbershop.logoUrl}
                  accentColor={barbershop.accentColor}
                  className="h-4 w-4"
                />
              </span>
              <p className="truncate text-sm text-muted-foreground">
                {barbershop.name}
              </p>
            </div>

            {booking.barber && (
              <p className="truncate text-xs text-muted-foreground">
                com {booking.barber.name}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center border-l border-white/[0.06] px-5">
            <p className="text-xs capitalize text-muted-foreground">
              {format(date, "MMM", { locale: ptBR })}
            </p>
            <p className="font-display text-2xl font-bold">
              {format(date, "dd")}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(date, "HH:mm")}
            </p>
          </div>
        </button>
      </SheetTrigger>

      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left font-display">
            Detalhes do agendamento
          </SheetTitle>
        </SheetHeader>

        <div className="relative mt-6 flex h-[170px] w-full items-end overflow-hidden rounded-lg">
          <Image
            alt=""
            src="/map.png"
            fill
            sizes="(max-width: 640px) 100vw, 448px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />

          <div className="surface relative m-3 flex w-full items-center gap-3 rounded-md p-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
              style={{
                boxShadow: `inset 0 0 0 1px ${barbershop.accentColor}40`,
              }}
            >
              <BarbershopLogo
                logoKey={barbershop.logoKey}
                logoUrl={barbershop.logoUrl}
                accentColor={barbershop.accentColor}
                className="h-6 w-6"
              />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-display font-bold">
                {barbershop.name}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {barbershop.address}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Badge
            className="w-fit"
            variant={isConfirmed ? "default" : "secondary"}
          >
            {isConfirmed ? "Confirmado" : "Concluído"}
          </Badge>

          <div className="mb-4 mt-4">
            <BookingSummary
              barbershopName={barbershop.name}
              serviceName={booking.service.name}
              price={formatCurrency(booking.service.price)}
              durationMinutes={booking.service.durationMinutes}
              barberName={booking.barber?.name}
              date={date}
            />
          </div>

          <div className="space-y-3">
            {barbershop.phones.map((phone, index) => (
              <PhoneItem key={index} phone={phone} />
            ))}
          </div>
        </div>

        <SheetFooter className="mt-6 flex-row gap-3">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Voltar
            </Button>
          </SheetClose>

          {isConfirmed && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%] max-w-sm">
                <DialogHeader>
                  <DialogTitle>Cancelar este agendamento?</DialogTitle>
                  <DialogDescription>
                    O horário volta a ficar disponível para outros clientes e
                    esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-3">
                  <DialogClose asChild>
                    <Button variant="secondary" className="w-full">
                      Manter
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className="w-full"
                  >
                    {cancelling ? "Cancelando…" : "Confirmar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingItem
