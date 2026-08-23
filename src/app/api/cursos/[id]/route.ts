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
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  const { id: rawId } = await props.params;
  const id = parseInt(rawId);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      codigo,
      nombreDelCurso,
      tipoModalidad,
      nivel,
      cargaHorariaDuracion,
      contenidoResumido,
      incluye,
      formaDePago,
      contactoInscripcion
    } = body;

    if (codigo) {
      const existing = await prisma.curso.findFirst({
        where: {
          codigo,
          NOT: { id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: "El código ya está en uso por otro curso" }, { status: 400 });
      }
    }

    const updatedCurso = await prisma.curso.update({
      where: { id },
      data: {
        codigo,
        nombreDelCurso,
        tipoModalidad,
        nivel,
        cargaHorariaDuracion,
        contenidoResumido,
        incluye,
        formaDePago,
        contactoInscripcion
      }
    });

    return NextResponse.json(updatedCurso);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Error al actualizar el curso" }, { status: 500 });
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
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  const { id: rawId } = await props.params;
  const id = parseInt(rawId);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.curso.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Curso eliminado con éxito" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Error al eliminar el curso" }, { status: 500 });
  }
}
