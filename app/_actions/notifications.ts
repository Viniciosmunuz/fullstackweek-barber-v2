"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"

async function currentUserId() {
  const session = await getServerSession(authOptions)
  return (session?.user as { id?: string } | undefined)?.id ?? null
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  href: string | null
  read: boolean
  createdAt: Date
}

/** Últimos avisos do usuário logado. */
export async function getNotifications(): Promise<{
  items: NotificationItem[]
  unread: number
}> {
  const userId = await currentUserId()
  if (!userId) return { items: [], unread: 0 }

  const [rows, unread] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        body: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    }),
    db.notification.count({ where: { userId, readAt: null } }),
  ])

  return {
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      href: row.href,
      read: row.readAt !== null,
      createdAt: row.createdAt,
    })),
    unread,
  }
}

/** Marca tudo como lido. O filtro por usuário impede zerar avisos alheios. */
export async function markNotificationsRead() {
  const userId = await currentUserId()
  if (!userId) return

  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  })

  revalidatePath("/", "layout")
}
