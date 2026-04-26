import { loadStyles } from "@/lib/store/styles";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const full = url.searchParams.get("full") === "1";
  const creatorId = url.searchParams.get("creatorId");
  const kind = url.searchParams.get("kind");
  const q = url.searchParams.get("q")?.toLowerCase().trim();

  const styles = await loadStyles();
  const filtered = styles.filter((style) => {
    if (creatorId && style.creatorId !== creatorId) {
      return false;
    }
    if (kind && style.kind !== kind) {
      return false;
    }
    if (q) {
      const blob = `${style.title} ${style.description} ${style.creatorName}`.toLowerCase();
      if (!blob.includes(q)) {
        return false;
      }
    }
    return true;
  });

  if (full) {
    return Response.json({ styles: filtered });
  }

  const trimmed = filtered.map((style) => ({
    id: style.id,
    kind: style.kind,
    creatorId: style.creatorId,
    creatorName: style.creatorName,
    title: style.title,
    description: style.description,
    pricePerGenerationSats: style.pricePerGenerationSats,
    previewImageUrl:
      style.kind === "art"
        ? (() => {
            const first = style.referenceImageUrls[0] ?? null;
            if (!first || first.startsWith("data:")) {
              return null;
            }
            return first;
          })()
        : null,
  }));

  return Response.json({ styles: trimmed });
}
