import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";


export async function POST(req: Request) {
  try {
    const { name, email, password  } = await req.json();

    

    // Validate the input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 401 }
      );
    }
    console.log("here");
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

   

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "OWNER",
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: user || "Something went wrong" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    
    return NextResponse.json(
      { message: error|| "Something went wrong" },
      { status: 500 }
    );
  }
}
