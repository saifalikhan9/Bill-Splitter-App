import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email } = body;
    
    if (!name || !email) {
      return new Response("Missing name or email", { status: 400 });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { name, email },
    });
    
    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}