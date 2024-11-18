import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await request.json();

  const findTicket = await prismaClient.ticket.findFirst({
    where: {
      id: id as string,
    },
  });

  if (!findTicket) {
    return NextResponse.json(
      { error: "Ticket não encontrado" },
      { status: 400 }
    );
  }

  try {
    await prismaClient.ticket.update({
      where: {
        id: id as string,
      },
      data: {
        status: "FECHADO",
      },
    });

    return NextResponse.json({ message: "Ticket atualizado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar ticket" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const { customerId, name, description } = await request.json();

  if (!customerId || !name || !description) {
    return NextResponse.json(
      { error: "Erro ao criar ticket" },
      { status: 400 }
    );
  }

  try {
    await prismaClient.ticket.create({
      data: {
        name, 
        description,
        status: "ABERTO",
        customerId: customerId,
      },
    });

    return NextResponse.json({ message: "Ticket criado com sucesso!" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar ticket" },
      { status: 400 }
    );
  }
}
