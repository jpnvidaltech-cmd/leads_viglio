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
    const productos = await prisma.producto.findMany({
      orderBy: { producto: "asc" }
    });
    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
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
    const { producto, descripcionBreve, precio, contacto } = body;

    if (!producto) {
      return NextResponse.json({ error: "El nombre del producto es obligatorio" }, { status: 400 });
    }

    const newProducto = await prisma.producto.create({
      data: {
        producto,
        descripcionBreve,
        precio,
        contacto,
        ultimaActualizacion: new Date(),
      }
    });

    return NextResponse.json(newProducto, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 });
  }
}
