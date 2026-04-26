import { NextResponse } from "next/server";
import { POST as mdkPOST } from "@moneydevkit/nextjs/server/route";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/mdk",
    method: "GET",
    message: "MDK webhook route is live",
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: unknown = null;
    let rawText = "";

    if (contentType.includes("application/json")) {
      rawText = await req.text();
      body = rawText ? JSON.parse(rawText) : {};
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
      rawText = JSON.stringify(body);
    } else {
      rawText = await req.text();
      body = rawText;
    }

    console.log("MDK webhook received:", {
      method: req.method,
      contentType,
      body,
    });

    const parsedBody = (body && typeof body === "object" ? body : null) as
      | Record<string, unknown>
      | null;
    const handler =
      typeof parsedBody?.handler === "string"
        ? parsedBody.handler
        : typeof parsedBody?.route === "string"
          ? parsedBody.route
          : typeof parsedBody?.target === "string"
            ? parsedBody.target
            : null;

    if (
      handler === "create_checkout" ||
      handler === "get_checkout" ||
      handler === "confirm_checkout" ||
      handler === "pay_invoice" ||
      handler === "list_products" ||
      handler === "get_customer"
    ) {
      const forwardReq = new Request(req.url, {
        method: "POST",
        headers: req.headers,
        body: rawText,
      });
      const response = await mdkPOST(forwardReq);
      const responseText = await response.text();
      let parsedResponse: unknown = null;
      try {
        parsedResponse = responseText ? JSON.parse(responseText) : {};
      } catch {
        parsedResponse = { ok: response.ok, raw: responseText };
      }
      return NextResponse.json(parsedResponse, { status: response.status });
    }

    return NextResponse.json({
      ok: true,
      received: true,
    });
  } catch (error) {
    console.error("MDK webhook failure:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown webhook error",
      },
      { status: 500 }
    );
  }
}
