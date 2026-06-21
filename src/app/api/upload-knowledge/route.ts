import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/src/lib/config";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }

    const formData = await request.formData();

    const backendRes = await fetch(
      API_BASE_URL + "/ai-support/admin/knowledge-bank",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const responseText = await backendRes.text();
    console.log("[upload-knowledge] status:", backendRes.status, "| body:", responseText.slice(0, 300));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("[upload-knowledge] proxy error:", error);
    return NextResponse.json({ message: "Proxy error", error: String(error) }, { status: 500 });
  }
}
