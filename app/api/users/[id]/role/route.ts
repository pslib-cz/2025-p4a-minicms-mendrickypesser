import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizováno." }, { status: 401 })
    }

    // Check that the requesting user is ADMIN
    const requestingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (!requestingUser || requestingUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nedostatečná oprávnění." },
        { status: 403 }
      )
    }

    const { role } = await req.json()
    const validRoles = ["USER", "EDITOR", "ADMIN"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Neplatná role." },
        { status: 400 }
      )
    }

    const { id } = await params

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json({
      message: "Role byla úspěšně změněna.",
      user: { id: updatedUser.id, role: updatedUser.role },
    })
  } catch (error) {
    console.error("Role update error:", error)
    return NextResponse.json(
      { error: "Došlo k chybě při změně role." },
      { status: 500 }
    )
  }
}
