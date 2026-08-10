"use client"

import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"

const formSchema = z.object({
  title: z.string().trim().min(1, { message: "Digite algo para buscar" }),
})

interface SearchProps {
  /** Preenche o campo ao voltar para uma busca já feita. */
  defaultValue?: string
  /**
   * Para onde enviar a busca. A home agora filtra na própria página, então
   * mandar sempre para /barbershops tiraria o usuário de onde ele já estava.
   */
  action?: string
}

const Search = ({ defaultValue = "", action = "/barbershops" }: SearchProps) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: defaultValue },
  })

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    router.push(`${action}?title=${encodeURIComponent(data.title)}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <div className="relative">
                  <SearchIcon
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Busque por barbearia ou cidade"
                    aria-label="Buscar barbearia ou cidade"
                    className="h-12 rounded-lg pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="h-12 px-5">
          <SearchIcon size={18} />
          <span className="sr-only sm:not-sr-only">Buscar</span>
        </Button>
      </form>
    </Form>
  )
}

export default Search
