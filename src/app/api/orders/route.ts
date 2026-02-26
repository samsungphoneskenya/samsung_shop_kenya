import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/actions/order-actions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createOrder(body);

    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Create order API error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

