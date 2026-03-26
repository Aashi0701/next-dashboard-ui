import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const lead = await prisma.lead.create({
    data: {
      name: body.name,
      phone: body.phone,
      classInterested: body.classInterested,
    },
  });

  return Response.json({ success: true, lead });
}