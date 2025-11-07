import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://5.129.246.215:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Ошибка при отправке запроса на сервер" },
      { status: 500 }
    );
  }
}
