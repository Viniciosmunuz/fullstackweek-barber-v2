import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import BarbershopLogo from "./brand/barbershop-logo"
import { publicRating } from "@/app/_lib/reviews"
import { cn } from "@/app/_lib/utils"

/**
 * Só os campos que o card usa, para o componente aceitar qualquer consulta com
 * `select` em vez de exigir a linha inteira do Prisma.
 */
export interface BarbershopCardData {
  id: string
  name: string
  slogan: string
  address: string
  neighborhood: string | null
  city: string
  imageUrl: string
  logoKey: string
  logoUrl: string | null
  accentColor: string
  rating: string | number
  reviewCount: number
  services?: { name: string }[]
}

interface BarbershopItemProps {
  barbershop: BarbershopCardData
  className?: string
}

/**
 * Card compacto de barbearia, desenhado para grade.
 *
 * A versão anterior era um bloco alto e largo, um por linha, que empurrava a
 * segunda barbearia para fora da tela no celular. Aqui a informação foi cortada
 * ao essencial — marca, nota, nome, localidade e dois serviços — para caberem
 * dois cards lado a lado em 375px sem apertar o texto.
 *
 * Quem ocupa o topo é a logo, não a foto do ambiente. Numa grade de vinte
 * cards, foto de barbearia toda parece a mesma coisa — espelho, cadeira,
 * parede escura — e a marca, que é o que distingue uma casa da outra, ficava
 * num selo de 20px no canto. A foto continua existindo: aparece grande assim
 * que o cliente abre a barbearia.
 *
 * O cartão inteiro é o link: em tela de toque, mirar um botão pequeno dentro do
 * card é pior do que tocar em qualquer lugar dele.
 */
const BarbershopItem = ({ barbershop, className }: BarbershopItemProps) => {
  const services = barbershop.services?.slice(0, 2) ?? []
  const place = barbershop.neighborhood || barbershop.city
  const nota = publicRating(Number(barbershop.rating), barbershop.reviewCount)

  return (
    <Link
      href={`/barbershops/${barbershop.id}`}
      className={cn(
        "surface group flex flex-col overflow-hidden rounded-lg transition-colors duration-200",
        "hover:border-primary/30 focus-visible:border-primary/40 active:bg-white/[0.04]",
        className,
      )}
    >
      {/*
        Quadrado, e não 4:3, porque a logo é gravada quadrada no enquadramento.
        Assim ela preenche o painel inteiro em vez de flutuar no meio dele.
      */}
      <div className="relative aspect-square w-full overflow-hidden">
        {/*
          Fundo tingido com a cor da própria casa. Sem a foto, é o que impede a
          grade de virar uma fileira de retângulos iguais.
        */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 50% 0%, ${barbershop.accentColor}26, transparent 68%)`,
          }}
        />

        {/*
          Sem margem: logo quadrada encosta nas quatro bordas. Só a que não for
          quadrada — as enviadas antes do enquadramento existir, e as silhuetas
          — é que sobra folga, e aí o `object-contain` centraliza sem cortar.
        */}
        <BarbershopLogo
          logoKey={barbershop.logoKey}
          logoUrl={barbershop.logoUrl}
          accentColor={barbershop.accentColor}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {/*
          A nota saiu de cima da imagem quando a logo passou a ocupar o painel
          inteiro: selo flutuante ali significa tapar justamente o canto da
          marca que a barbearia escolheu mostrar.
        */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-display text-[13px] font-bold leading-tight sm:text-sm">
            {barbershop.name}
          </h3>

          {/*
            Três estados, e cada um diz uma verdade diferente: sem avaliação
            nenhuma, com poucas demais para virar média, e com base suficiente.
            Antes toda barbearia nascia com 5,0 e exibia isso como se alguém
            tivesse dado — o que enganava o cliente e ainda ordenava o catálogo.
          */}
          {nota !== null ? (
            <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold">
              <Star size={10} className="fill-primary text-primary" />
              {nota.toFixed(1).replace(".", ",")}
              <span className="font-normal text-muted-foreground">
                ({barbershop.reviewCount})
              </span>
            </span>
          ) : (
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
              {barbershop.reviewCount > 0
                ? `${barbershop.reviewCount} ${barbershop.reviewCount === 1 ? "avaliação" : "avaliações"}`
                : "Nova"}
            </span>
          )}
        </div>

        {services.length > 0 && (
          <p className="truncate text-[11px] text-muted-foreground">
            {services.map((service) => service.name).join(" · ")}
          </p>
        )}

        <p className="mt-auto flex items-center gap-1 pt-1 text-[11px] text-muted-foreground">
          <MapPin size={11} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{place}</span>
        </p>
      </div>
    </Link>
  )
}

export default BarbershopItem
