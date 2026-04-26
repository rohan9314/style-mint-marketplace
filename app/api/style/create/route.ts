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

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as CreateBody;
  const price = Number(body.pricePerGenerationSats);

  if (
    !body.kind ||
    !body.creatorId ||
    !body.creatorName ||
    !body.title ||
    !Array.isArray(body.samples) ||
    !Number.isFinite(price) ||
    price < 1
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.kind === "art" && (body.samples.length < 3 || body.samples.length > 8)) {
    return Response.json(
      { error: "Art styles require 3-8 image samples." },
      { status: 400 },
    );
  }
  if (body.kind === "writing" && (body.samples.length < 2 || body.samples.length > 5)) {
    return Response.json(
      { error: "Writing styles require 2-5 text samples." },
      { status: 400 },
    );
  }

  if (body.samples.some((sample) => typeof sample !== "string" || sample.length > 5_000_000)) {
    return Response.json(
      { error: "One or more samples are invalid or too large." },
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
    { styleId: style.id, styleProfile: style.styleProfile },
    { status: 201 },
  );
}
