// app/api/orders/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const order = await req.json();

    console.log("Новый заказ:", order);

    return NextResponse.json({ message: "Заказ получен" }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при получении заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
