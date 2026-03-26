import { NextRequest, NextResponse } from "next/server";
import https from "https";

export const maxDuration = 300; // Vercel Pro max
export const dynamic = "force-dynamic";

/** استدعاء الـ webhook بـ JSON بدون timeout */
function callWebhookRaw(
  url: string,
  body: string,
  extraHeaders: Record<string, string> = {}
): Promise<{ status: number; contentType: string; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : 443,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        ...extraHeaders,
      },
      timeout: 0,
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 200,
          contentType: (res.headers["content-type"] ?? "").toLowerCase(),
          buffer: Buffer.concat(chunks),
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("TIMEOUT"));
    });
    req.write(body);
    req.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ── القراءة من הـ UI ───────────────────────
    const imageUrl = (formData.get("image_url") as string) || "";
    const rawImageUrls = (formData.get("image_urls") as string) || "";
    const presetSetting = (formData.get("preset_setting") as string) || "";
    const lightingStyle = (formData.get("lighting_style") as string) || "";
    const visualStyle = (formData.get("visual_style") as string) || "";
    const cameraAngle = (formData.get("camera_angle") as string) || "";
    const additionalPrompt = (formData.get("additional_prompt") as string) || "";

    const WEBHOOK_URL =

      "https://auto.mosaady.com/webhook/017f7918-936a-4e2d-bc1e-a1b5f627fdad";

    // ── تجهيز Body الـ webhook ──────────────────────────────────
    const prompt_exist = additionalPrompt.trim().length > 0 ? "yes" : "no";

    let imageUrls: string[] = [];
    if (rawImageUrls) {
      try {
        const parsed = JSON.parse(rawImageUrls);
        if (Array.isArray(parsed)) {
          imageUrls = parsed.filter((x) => typeof x === "string" && x.trim().length > 0);
        }
      } catch {
        // ignore malformed value and fallback to single image
      }
    }
    if (imageUrls.length === 0 && imageUrl) {
      imageUrls = [imageUrl];
    }

    const fields: Record<string, any> = {
      image_url: imageUrls[0] || imageUrl,
      preset_setting: presetSetting,
      prompt_exist,
    };
    if (imageUrls.length > 1) fields.image_urls = imageUrls;

    if (lightingStyle) fields.lighting_style = lightingStyle;
    if (visualStyle) fields.visual_style = visualStyle;
    if (cameraAngle) fields.camera_angle = cameraAngle;
    if (additionalPrompt) fields.additional_prompt = additionalPrompt;

    console.log("[ai-photographer] → fields:", JSON.stringify(fields));

    // استدعاء הـ webhook
    const webhookRes = await callWebhookRaw(WEBHOOK_URL, JSON.stringify(fields));

    const responseBuffer = webhookRes.buffer;
    const responseSize = responseBuffer.length;
    const contentType = webhookRes.contentType;
    const resStatus = webhookRes.status;

    console.log(
      "[ai-photographer] webhook:",
      resStatus,
      contentType,
      responseSize,
      "bytes"
    );

    if (resStatus < 200 || resStatus >= 300) {
      const errText =
        responseSize > 0 ? responseBuffer.toString("utf-8") : `HTTP ${resStatus}`;
      return NextResponse.json(
        {
          error: `فشل الاتصال بخادم الذكاء الاصطناعي (${resStatus}).`,
          detail: errText.substring(0, 300),
        },
        { status: resStatus }
      );
    }

    if (responseSize === 0) {
      console.error("[ai-photographer] empty body from webhook");
      return NextResponse.json(
        {
          error:
            "لم يُرجع خادم الذكاء الاصطناعي أي بيانات. تأكد من أن الـ n8n workflow يعمل بشكل صحيح.",
        },
        { status: 502 }
      );
    }

    const images: string[] = [];

    if (contentType.startsWith("image/")) {
      const b64 = responseBuffer.toString("base64");
      const mime = contentType.split(";")[0].trim();
      images.push(`data:${mime};base64,${b64}`);
    } else if (contentType.includes("application/json")) {
      let data: any;
      try {
        data = JSON.parse(responseBuffer.toString("utf-8"));
      } catch (parseError) {
        console.error("[ai-photographer] JSON parse error on payload:", responseBuffer.toString("utf-8").substring(0, 1000));
        return NextResponse.json(
          {
            error: "استجابة غير صالحة من خادم الذكاء الاصطناعي. (Parsing Error)",
            detail: responseBuffer.toString("utf-8").substring(0, 500)
          },
          { status: 502 }
        );
      }

      // Check common n8n response structures
      if (Array.isArray(data.images) && data.images.length > 0) {
        images.push(...data.images.filter((i: any) => typeof i === "string"));
      } else if (typeof data.image_url === "string") {
        images.push(data.image_url);
      } else if (typeof data.image === "string") {
        images.push(data.image.startsWith("http") ? data.image : `data:image/png;base64,${data.image}`);
      } else if (typeof data.image_base64 === "string") {
        images.push(`data:image/png;base64,${data.image_base64}`);
      } else if (data.body && typeof data.body.image_url === "string") {
        images.push(data.body.image_url);
      } else {
        console.error(
          "[ai-photographer] no image in JSON:",
          JSON.stringify(data).substring(0, 300)
        );
        return NextResponse.json(
          {
            error: "لم يتضمن الرد أي صورة.",
            detail: JSON.stringify(data).substring(0, 300),
          },
          { status: 502 }
        );
      }
    } else {
      return NextResponse.json(
        { error: `نوع استجابة غير متوقع من الخادم: ${contentType}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ images });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === "AbortError" || err.message === "TIMEOUT")
    ) {
      return NextResponse.json(
        {
          error:
            "انتهت مهلة الاتصال بخادم الذكاء الاصطناعي. الخادم مشغول، يرجى المحاولة مرة أخرى بعد قليل.",
        },
        { status: 504 }
      );
    }
    console.error("[ai-photographer/image]", err);
    return NextResponse.json(
      { error: "حدث خطأ داخلي أثناء توليد الصورة." },
      { status: 500 }
    );
  }
}
