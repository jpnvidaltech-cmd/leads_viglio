import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const cursos = await prisma.curso.findMany({
      include: {
        ediciones: {
          orderBy: { fechaInicio: "asc" }
        }
      },
      orderBy: { id: "asc" }
    });
    return NextResponse.json(cursos);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 });
  }
}

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
      codigo,
      nombreDelCurso,
      tipoModalidad,
      nivel,
      cargaHorariaDuracion,
      contenidoResumido,
      incluye,
      formaDePago,
      contactoInscripcion,
      ediciones
    } = body;

    if (!codigo) {
      return NextResponse.json({ error: "El código es requerido" }, { status: 400 });
    }

    // Verificar si el código ya existe
    const existing = await prisma.curso.findUnique({
      where: { codigo }
    });
    if (existing) {
      return NextResponse.json({ error: "El código del curso ya existe" }, { status: 400 });
    }

    const newCurso = await prisma.curso.create({
      data: {
        codigo,
        nombreDelCurso,
        tipoModalidad,
        nivel,
        cargaHorariaDuracion,
        contenidoResumido,
        incluye,
        formaDePago,
        contactoInscripcion,
        ediciones: {
          create: (ediciones || []).map((ed: any) => ({
            nombreEdicion: ed.nombreEdicion,
            dictante: ed.dictante,
            fechaInicio: ed.fechaInicio ? new Date(ed.fechaInicio) : null,
            fechasEspecificas: ed.fechasEspecificas,
            participantes: ed.participantes,
            precio: ed.precio,
            estado: ed.estado || "Programada"
          }))
        }
      },
      include: {
        ediciones: true
      }
    });

    return NextResponse.json(newCurso, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Error al crear el curso" }, { status: 500 });
  }
}
