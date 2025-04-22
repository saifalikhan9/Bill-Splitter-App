import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  } 
  const { id  } : {id: unknown} = params;
  const body = await req.json();
  const { name, email } = body;
  if (!name || !email) {
    return new Response("Missing name or email", { status: 400 });
  }
  try {
    const user = await prisma.user.update({
      where: { id: id as  },
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
