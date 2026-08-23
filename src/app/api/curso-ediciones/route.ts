import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Prohibido: requiere rol administrador" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      cursoId,
      nombreEdicion,
      dictante,
      fechaInicio,
      fechasEspecificas,
      participantes,
      precio,
      estado
    } = body;

    if (!cursoId) {
      return NextResponse.json({ error: "El ID del curso es requerido" }, { status: 400 });
    }

    const newEdicion = await prisma.cursoEdicion.create({
      data: {
        cursoId: parseInt(cursoId),
        nombreEdicion,
        dictante,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechasEspecificas,
        participantes,
        precio,
        estado
      }
    });

    return NextResponse.json(newEdicion, { status: 201 });
  } catch (error) {
    console.error("Error creating course edition:", error);
    return NextResponse.json({ error: "Error al crear la edición del curso" }, { status: 500 });
  }
}
