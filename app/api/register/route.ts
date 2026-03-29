import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail a heslo jsou povinné." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Heslo musí mít alespoň 6 znaků." },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Uživatel s tímto e-mailem již existuje." },
        { status: 409 }
      )
    }

    // Create user with hashed password and default role USER
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: "USER",
      },
    })

    return NextResponse.json(
      { message: "Registrace proběhla úspěšně.", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Došlo k chybě při registraci." },
      { status: 500 }
    )
  }
}
