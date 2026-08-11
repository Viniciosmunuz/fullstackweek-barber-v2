"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import {
  CalendarDays,
  ChevronDown,
  Home,
  LogInIcon,
  LogOutIcon,
  ShieldCheck,
  Store,
} from "lucide-react"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import {
  TOOLS_LABEL,
  toolsFor,
  type ToolsRole,
} from "../_constants/dashboard-nav"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import SignInDialog from "./sign-in-dialog"
import { BarberFlowLogo } from "./brand/logo"
import { cn, getInitials } from "@/app/_lib/utils"

interface SidebarSheetProps {
  /**
   * Papel de quem está logado, definido pelo servidor: o cliente não decide o
   * próprio papel. `null` para quem só usa o site como cliente.
   *
   * Esconder os links é só higiene de interface — o bloqueio real está nas
   * rotas e nas server actions, que recusam de novo a cada gravação.
   */
  toolsRole?: ToolsRole | null
}

/**
 * Um bloco de links do menu, com título opcional.
 *
 * Existia só na lista de serviços; virou peça para os três blocos usarem o
 * mesmo título e o mesmo respiro. Cada bloco é um `nav` próprio porque são
 * grupos de navegação distintos, e o leitor de tela anuncia o título de cada um
 * ao entrar.
 */
const MenuSection = ({
  label,
  showLabel = true,
  children,
}: {
  label: string
  /**
   * Quando falso, o título continua valendo para leitor de tela mas não ocupa
   * espaço na tela — útil no bloco que não precisa se distinguir de nenhum
   * outro.
   */
  showLabel?: boolean
  children: React.ReactNode
}) => (
  <nav aria-label={label} className="border-b border-white/[0.06] py-4">
    {showLabel && (
      <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    )}
    <div className="flex flex-col gap-1">{children}</div>
  </nav>
)

/**
 * Bloco de ferramentas, que abre e fecha.
 *
 * Antes o menu levava a "Painel da barbearia" e as ferramentas de verdade só
 * apareciam depois, na barra lateral do painel — duas paradas para chegar na
 * agenda. Aqui elas estão à mão, e a lista é a do papel de quem abriu: o
 * colaborador não vê porta que só se fecha na cara dele.
 *
 * Nasce aberto porque é o motivo de existir do menu para quem trabalha na
 * casa; fecha para quem quiser o menu curto.
 */
const ToolsSection = ({ role }: { role: ToolsRole }) => {
  const [open, setOpen] = useState(true)
  const label = TOOLS_LABEL[role]

  return (
    <div className="border-b border-white/[0.06] py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="menu-ferramentas"
        className="flex w-full items-center justify-between gap-2 rounded-md px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <nav
          id="menu-ferramentas"
          aria-label={label}
          className="mt-2 flex flex-col gap-1"
        >
          {role === "admin" && (
            <SheetClose asChild>
              <Button className="justify-start gap-3" variant="ghost" asChild>
                <Link href="/admin">
                  <ShieldCheck size={18} className="text-primary" />
                  Barbearias parceiras
                </Link>
              </Button>
            </SheetClose>
          )}

          {toolsFor(role).map(({ href, label: item, icon: Icon }) => (
            <SheetClose key={href} asChild>
              <Button className="justify-start gap-3" variant="ghost" asChild>
                <Link href={href}>
                  <Icon size={18} className="text-primary" />
                  {item}
                </Link>
              </Button>
            </SheetClose>
          ))}
        </nav>
      )}
    </div>
  )
}

const SidebarSheet = ({ toolsRole = null }: SidebarSheetProps) => {
  const { data } = useSession()
  const handleLogoutClick = () => signOut()

  /*
   * Quem só usa o site como cliente vê a lista como sempre viu: sem título,
   * porque um "CLIENTE" sozinho no topo não separa de nada. O título aparece
   * quando existe um segundo bloco do outro lado — aí ele passa a informar.
   */
  const hasTools = toolsRole !== null

  const clientLinks = (
    <>
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
    </>
  )

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

      <MenuSection label="Cliente" showLabel={hasTools}>
        {clientLinks}
      </MenuSection>

      {toolsRole && <ToolsSection role={toolsRole} />}

      <MenuSection label="Serviços">
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
      </MenuSection>

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
