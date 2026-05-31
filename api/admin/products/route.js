import { NextResponse } from "next/server";

/** Admin product API — connect Prisma + admin auth check */
export async function GET() {
  return NextResponse.json(
    { message: "Connect Prisma product repository" },
    { status: 501 },
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Create product — not implemented" },
    { status: 501 },
  );
}
