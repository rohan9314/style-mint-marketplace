import { ingestArtStyle } from "@/lib/agents/art-style-agent";
import { ingestWritingStyle } from "@/lib/agents/writing-style-agent";
import { loadStyles, saveStyles } from "@/lib/store/styles";

interface CreateBody {
  kind: "art" | "writing";
  creatorId: string;
  creatorName: string;
  title: string;
  description?: string;
  pricePerGenerationSats: number;
  samples: string[];
}

function normalizeCreatorId(creatorName: string): string {
  return `creator_${creatorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type || "application/octet-stream";
  return `data:${mimeType};base64,${base64}`;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const method = req.method;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const creatorName = String(formData.get("creatorName") ?? "").trim();
      const styleTitle = String(formData.get("styleTitle") ?? "").trim();
      const styleDescription = String(formData.get("styleDescription") ?? "").trim();
      const priceSatsRaw = String(formData.get("priceSats") ?? "").trim();
      const priceSats = Number(priceSatsRaw);
      const referenceImages = formData
        .getAll("referenceImages")
        .filter((entry): entry is File => entry instanceof File);

      console.info("[style/create] request", {
        method,
        contentType,
        formDataKeys: Array.from(formData.keys()),
        creatorName,
        styleTitle,
        styleDescription,
        priceSats,
        referenceImagesCount: referenceImages.length,
        referenceImages: referenceImages.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      });

      if (!creatorName) {
        return Response.json({ ok: false, error: "creatorName is required." }, { status: 400 });
      }
      if (!styleTitle) {
        return Response.json({ ok: false, error: "styleTitle is required." }, { status: 400 });
      }
      if (!styleDescription) {
        return Response.json({ ok: false, error: "styleDescription is required." }, { status: 400 });
      }
      if (!Number.isFinite(priceSats) || priceSats <= 0) {
        return Response.json({ ok: false, error: "priceSats must be greater than 0." }, { status: 400 });
      }
      if (referenceImages.length < 3 || referenceImages.length > 8) {
        return Response.json(
          { ok: false, error: "referenceImages must include between 3 and 8 images." },
          { status: 400 },
        );
      }
      if (referenceImages.some((file) => !file.type.startsWith("image/"))) {
        return Response.json(
          { ok: false, error: "All referenceImages must be image files." },
          { status: 400 },
        );
      }

      const imageUrls = await Promise.all(referenceImages.map(fileToDataUrl));
      const style = await ingestArtStyle({
        creatorId: normalizeCreatorId(creatorName),
        creatorName,
        title: styleTitle,
        description: styleDescription,
        pricePerGenerationSats: priceSats,
        imageUrls,
      });

      const styles = await loadStyles();
      await saveStyles([style, ...styles]);

      return Response.json(
        { ok: true, styleId: style.id, styleProfile: style.styleProfile },
        { status: 201 },
      );
    }

    const body = (await req.json()) as CreateBody;
    const price = Number(body.pricePerGenerationSats);

    console.info("[style/create] request", {
      method,
      contentType,
      formDataKeys: [],
      creatorName: body.creatorName,
      styleTitle: body.title,
      styleDescription: body.description,
      priceSats: price,
      referenceImagesCount: body.kind === "art" ? body.samples?.length ?? 0 : 0,
      referenceImages: [],
    });

    if (
      !body.kind ||
      !body.creatorId ||
      !body.creatorName ||
      !body.title ||
      !Array.isArray(body.samples) ||
      !Number.isFinite(price) ||
      price < 1
    ) {
      return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    if (body.kind === "art" && (body.samples.length < 3 || body.samples.length > 8)) {
      return Response.json(
        { ok: false, error: "Art styles require 3-8 image samples." },
        { status: 400 },
      );
    }
    if (body.kind === "writing" && (body.samples.length < 2 || body.samples.length > 5)) {
      return Response.json(
        { ok: false, error: "Writing styles require 2-5 text samples." },
        { status: 400 },
      );
    }

    if (body.samples.some((sample) => typeof sample !== "string" || sample.length > 5_000_000)) {
      return Response.json(
        { ok: false, error: "One or more samples are invalid or too large." },
        { status: 400 },
      );
    }

    const style =
      body.kind === "art"
        ? await ingestArtStyle({
            creatorId: body.creatorId,
            creatorName: body.creatorName,
            title: body.title,
            description: body.description,
            pricePerGenerationSats: price,
            imageUrls: body.samples,
          })
        : await ingestWritingStyle({
            creatorId: body.creatorId,
            creatorName: body.creatorName,
            title: body.title,
            description: body.description,
            pricePerGenerationSats: price,
            samples: body.samples,
          });

    const styles = await loadStyles();
    await saveStyles([style, ...styles]);

    return Response.json(
      { ok: true, styleId: style.id, styleProfile: style.styleProfile },
      { status: 201 },
    );
  } catch (error) {
    console.error("[style/create] unhandled error", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
