import {
  deleteStyleById,
  getStyleById,
  updateStyleById,
} from "@/lib/store/styles";

interface UpdateBody {
  title?: string;
  description?: string;
  pricePerGenerationSats?: number;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const body = (await req.json()) as UpdateBody;

  if (
    body.pricePerGenerationSats !== undefined &&
    (!Number.isFinite(body.pricePerGenerationSats) || body.pricePerGenerationSats < 1)
  ) {
    return Response.json(
      { error: "pricePerGenerationSats must be a positive number." },
      { status: 400 },
    );
  }

  const updated = await updateStyleById(id, {
    title: body.title,
    description: body.description,
    pricePerGenerationSats: body.pricePerGenerationSats,
  });

  if (!updated) {
    return Response.json({ error: "Style not found" }, { status: 404 });
  }

  return Response.json({ style: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const style = await getStyleById(id);
  if (!style) {
    return Response.json({ error: "Style not found" }, { status: 404 });
  }

  await deleteStyleById(id);
  return Response.json({ success: true });
}
