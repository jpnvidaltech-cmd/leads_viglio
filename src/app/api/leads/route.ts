import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const requiresFollowUp = searchParams.get("requiresFollowUp");
  const search = searchParams.get("search");

  const whereClause: any = {};

  if (channel && channel !== "all") {
    whereClause.channel = {
      equals: channel,
      mode: "insensitive"
    };
  }

  if (requiresFollowUp && requiresFollowUp !== "all") {
    whereClause.requiereFollowup = requiresFollowUp === "true";
  }

  if (search) {
    whereClause.OR = [
      { contactName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { telegramId: { contains: search, mode: "insensitive" } },
      { instagramId: { contains: search, mode: "insensitive" } },
      { categoriaInteres: { contains: search, mode: "insensitive" } },
      { detalleInteres: { contains: search, mode: "insensitive" } },
      { resumenEjecutivo: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const leads = await prisma.leadConversacion.findMany({
      where: whereClause,
      orderBy: [
        { fechaMensaje: "desc" },
        { horaMensaje: "desc" },
        { id: "desc" }
      ],
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Error al obtener leads" }, { status: 500 });
  }
}
