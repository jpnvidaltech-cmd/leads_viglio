import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Prohibido: requiere rol administrador" }, { status: 403 });
  }

  const { id: rawId } = await props.params;
  const id = parseInt(rawId);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await request.json();

  // Evitar auto-modificación crítica si desactiva su cuenta
  if (session.user.id === id.toString()) {
    if (body.activo === false || (body.rol && body.rol !== "admin")) {
      return NextResponse.json(
        { error: "No puedes desactivar tu propia cuenta ni cambiar tu rol de administrador" },
        { status: 400 }
      );
    }
  }

  try {
    const { nombre, rol, activo } = body;

    const updatedUser = await prisma.usuario.update({
      where: { id },
      data: {
        nombre,
        rol,
        activo
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Prohibido: requiere rol administrador" }, { status: 403 });
  }

  const { id: rawId } = await props.params;
  const id = parseInt(rawId);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // Evitar auto-eliminación
  if (session.user.id === id.toString()) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta de administrador" }, { status: 400 });
  }

  try {
    await prisma.usuario.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 });
  }
}
