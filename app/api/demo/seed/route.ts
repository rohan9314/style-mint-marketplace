import { seedDemoStyles } from "@/lib/demo/seed-styles";

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as {
    replaceExisting?: boolean;
  };

  const result = await seedDemoStyles({
    replaceExisting: body.replaceExisting ?? false,
  });

  return Response.json({
    ok: true,
    ...result,
  });
}
