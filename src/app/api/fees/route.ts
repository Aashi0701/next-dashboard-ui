import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/getSessionUser";

export async function POST(req: Request) {
  const session = await getSessionUser();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { classId, title, amount } = await req.json();

  if (!title || !amount) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await prisma.feeStructure.create({
    data: {
      title,
      amount,
      classId: classId || null,
      isActive: true,
    },
  });

  return NextResponse.json({ success: true });
}
