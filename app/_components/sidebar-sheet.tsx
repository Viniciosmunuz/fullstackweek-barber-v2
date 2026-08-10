"use client"

import { Button } from "./ui/button"
import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogInIcon,
  LogOutIcon,
  ShieldCheck,
  Store,
} from "lucide-react"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import SignInDialog from "./sign-in-dialog"
import { BarberFlowLogo } from "./brand/logo"
import { getInitials } from "@/app/_lib/utils"

interface SidebarSheetProps {
  /**
   * Definidos pelo servidor: o cliente não decide o próprio papel. Esconder os
   * links é só higiene de interface — o bloqueio real está nas rotas e nas
   * server actions.
   */
  canAccessDashboard?: boolean
  isPlatformAdmin?: boolean
}

const SidebarSheet = ({
  canAccessDashboard = false,
  isPlatformAdmin = false,
}: SidebarSheetProps) => {
  const { data } = useSession()
  const handleLogoutClick = () => signOut()

  return (
    <SheetContent className="w-[88%] overflow-y-auto sm:max-w-sm">
      <SheetHeader>
        <SheetTitle className="text-left">
          <BarberFlowLogo size="sm" />
        </SheetTitle>
      </SheetHeader>

      <div className="mt-6 border-b border-white/[0.06] pb-6">
        {data?.user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={data.user.image ?? ""} alt="" />
              <AvatarFallback>
                {getInitials(data.user.name ?? "Cliente")}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate font-semibold">{data.user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {data.user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold">Olá, faça seu login</p>
              <p className="text-xs text-muted-foreground">
                Para agendar e acompanhar seus horários.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" aria-label="Entrar">
                  <LogInIcon size={18} />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%] max-w-sm">
                <SignInDialog />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1 border-b border-white/[0.06] py-4">
        <SheetClose asChild>
          <Button className="justify-start gap-3" variant="ghost" asChild>
            <Link href="/">
              <Home size={18} />
              Início
            </Link>
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button className="justify-start gap-3" variant="ghost" asChild>
            <Link href="/barbershops">
              <Store size={18} />
              Barbearias
            </Link>
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button className="justify-start gap-3" variant="ghost" asChild>
            <Link href="/bookings">
              <CalendarDays size={18} />
              Meus agendamentos
            </Link>
          </Button>
        </SheetClose>
        {canAccessDashboard && (
          <SheetClose asChild>
            <Button className="justify-start gap-3" variant="ghost" asChild>
              <Link href="/dashboard">
                <LayoutDashboard size={18} />
                Painel da barbearia
              </Link>
            </Button>
          </SheetClose>
        )}

        {isPlatformAdmin && (
          <SheetClose asChild>
            <Button className="justify-start gap-3" variant="ghost" asChild>
              <Link href="/admin">
                <ShieldCheck size={18} />
                Barbearias parceiras
              </Link>
            </Button>
          </SheetClose>
        )}
      </nav>

      <div className="border-b border-white/[0.06] py-4">
        <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Serviços
        </p>
        <div className="flex flex-col gap-1">
          {quickSearchOptions.map(({ icon: Icon, title }) => (
            <SheetClose key={title} asChild>
              <Button className="justify-start gap-3" variant="ghost" asChild>
                <Link href={`/barbershops?service=${encodeURIComponent(title)}`}>
                  <Icon size={18} className="text-primary" />
                  {title}
                </Link>
              </Button>
            </SheetClose>
          ))}
        </div>
      </div>

      {data?.user && (
        <div className="py-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogoutClick}
          >
            <LogOutIcon size={18} />
            Sair da conta
          </Button>
        </div>
      )}
    </SheetContent>
  )
}

export default SidebarSheet
