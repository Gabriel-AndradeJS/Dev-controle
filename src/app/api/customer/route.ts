import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerEmail = searchParams.get("email");

  if (!customerEmail || customerEmail === "") {
    return NextResponse.json(
      { error: "Falha ao buscar cliente" },
      { status: 400 }
    );
  }

  try {
    const customer = await prismaClient.customer.findFirst({
      where: {
        email: customerEmail as string,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao buscar cliente" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json(
      { error: "Falha ao deletar cliente" },
      { status: 400 }
    );
  }

  const findTicket = await prismaClient.ticket.findFirst({
    where: {
      customerId: userId,
    },
  });

  if (findTicket) {
    return NextResponse.json(
      { error: "Cliente possui tickets cadastrados" },
      { status: 400 }
    );
  }

  try {
    await prismaClient.customer.delete({
      where: {
        id: userId as string,
      },
    });
    return NextResponse.json({ message: "Cliente deletado com sucesso!" });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao deletar cliente" },
      { status: 400 }
    );
  }
}

//Rota cadastro de cliente
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Usuário não autenticado" },
      { status: 401 }
    );
  }
  const { name, email, phone, addres, userId } = await request.json();
  console.log(userId);

  try {
    await prismaClient.customer.create({
      data: {
        name,
        email,
        phone,
        addres: addres ? addres : "",
        userId: userId,
      },
    });

    return NextResponse.json({ message: "Cliente cadastrado com sucesso!" });
  } catch (error) {
    return NextResponse.json(
      { message: "Falha ao cadastrar cliente" },
      { status: 400 }
    );
  }
}
