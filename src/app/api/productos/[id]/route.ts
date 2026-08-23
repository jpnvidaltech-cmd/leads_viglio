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
    const { producto, descripcionBreve, precio, contacto } = body;

    const updatedProducto = await prisma.producto.update({
      where: { id },
      data: {
        producto,
        descripcionBreve,
        precio,
        contacto,
        ultimaActualizacion: new Date(),
      }
    });

    return NextResponse.json(updatedProducto);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 });
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
    await prisma.producto.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 });
  }
}
