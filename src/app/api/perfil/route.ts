import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Ambas contraseñas son obligatorias" }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Validar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash
      }
    });

    return NextResponse.json({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 });
  }
}
