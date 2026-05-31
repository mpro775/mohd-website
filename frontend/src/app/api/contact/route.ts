import { NextResponse } from "next/server";
import { publicApi } from "@/lib/api/public";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await publicApi.contact(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Request failed" }, { status: 400 });
  }
}
