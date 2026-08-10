"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, BellOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import {
  markNotificationsRead,
  type NotificationItem,
} from "@/app/_actions/notifications"
import { cn } from "@/app/_lib/utils"

interface NotificationBellProps {
  items: NotificationItem[]
  unread: number
}

/**
 * Avisos de quem administra a barbearia.
 *
 * Abrir o painel já marca tudo como lido: se a pessoa está olhando a lista, o
 * ponto vermelho perdeu a função. Marcar só ao clicar em cada item deixaria o
 * contador teimando por avisos que ela já leu.
 */
const NotificationBell = ({ items, unread }: NotificationBellProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()

  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (next && unread > 0) {
      startTransition(async () => {
        await markNotificationsRead()
        router.refresh()
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="relative"
          aria-label={
            unread > 0 ? `Notificações, ${unread} não lidas` : "Notificações"
          }
        >
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-left font-display">
            Notificações
          </SheetTitle>
        </SheetHeader>

        {items.length > 0 ? (
          <ul className="mt-6 space-y-2">
            {items.map((item) => {
              const content = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    {!item.read && (
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-label="Não lida"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </>
              )

              return (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-lg border border-white/[0.06] p-3 transition-colors hover:border-primary/30 hover:bg-white/[0.03]",
                        !item.read && "bg-primary/[0.05]",
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "rounded-lg border border-white/[0.06] p-3",
                        !item.read && "bg-primary/[0.05]",
                      )}
                    >
                      {content}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
              <BellOff size={20} />
            </span>
            <p className="mt-3 font-display font-bold">Nada por aqui</p>
            <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
              Novos agendamentos na sua barbearia aparecem nesta lista.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default NotificationBell
