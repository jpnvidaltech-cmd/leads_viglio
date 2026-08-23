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
    const catalogo = await prisma.catalogoDigital.findMany({
      orderBy: { producto: "asc" }
    });
    return NextResponse.json(catalogo);
  } catch (error) {
    console.error("Error fetching digital catalog:", error);
    return NextResponse.json({ error: "Error al obtener catálogo" }, { status: 500 });
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
    const { producto, precioActual, precioOriginal, moneda, enOferta, gratis, notas } = body;

    if (!producto) {
      return NextResponse.json({ error: "El nombre del producto es obligatorio" }, { status: 400 });
    }

    const newItem = await prisma.catalogoDigital.create({
      data: {
        producto,
        precioActual: precioActual ? parseFloat(precioActual) : 0,
        precioOriginal: precioOriginal ? parseFloat(precioOriginal) : null,
        moneda: moneda || "USD",
        enOferta: !!enOferta,
        gratis: !!gratis,
        notas,
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating digital catalog item:", error);
    return NextResponse.json({ error: "Error al crear elemento en el catálogo" }, { status: 500 });
  }
}
