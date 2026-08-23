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
    const { producto, precioActual, precioOriginal, moneda, enOferta, gratis, notas } = body;

    const updatedItem = await prisma.catalogoDigital.update({
      where: { id },
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating digital catalog item:", error);
    return NextResponse.json({ error: "Error al actualizar elemento" }, { status: 500 });
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
    await prisma.catalogoDigital.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Elemento eliminado con éxito" });
  } catch (error) {
    console.error("Error deleting digital catalog item:", error);
    return NextResponse.json({ error: "Error al eliminar elemento" }, { status: 500 });
  }
}
