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

  try {
    const body = await request.json();
    const {
      nombreEdicion,
      dictante,
      fechaInicio,
      fechasEspecificas,
      participantes,
      precio,
      estado
    } = body;

    const updatedEdicion = await prisma.cursoEdicion.update({
      where: { id },
      data: {
        nombreEdicion,
        dictante,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechasEspecificas,
        participantes,
        precio,
        estado
      }
    });

    return NextResponse.json(updatedEdicion);
  } catch (error) {
    console.error("Error updating course edition:", error);
    return NextResponse.json({ error: "Error al actualizar la edición" }, { status: 500 });
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

  try {
    await prisma.cursoEdicion.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Edición eliminada con éxito" });
  } catch (error) {
    console.error("Error deleting course edition:", error);
    return NextResponse.json({ error: "Error al eliminar la edición" }, { status: 500 });
  }
}
