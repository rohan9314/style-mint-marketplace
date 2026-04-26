import { getEarningsForCreator } from "@/lib/lightning/earnings";
import { loadStyles } from "@/lib/store/styles";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: creatorId } = await context.params;
  const styles = await loadStyles();
  const creatorStyle = styles.find((style) => style.creatorId === creatorId);

  if (!creatorStyle) {
    return Response.json({ error: "Creator not found" }, { status: 404 });
  }

  const events = await getEarningsForCreator(creatorId);
  const totalEarningsSats = events.reduce((sum, event) => sum + event.amountSats, 0);

  return Response.json({
    creatorId,
    creatorName: creatorStyle.creatorName,
    totalEarningsSats,
    generationCount: events.length,
    recentEvents: events.slice(0, 10).map((event) => ({
      amountSats: event.amountSats,
      buyerKind: event.buyerKind,
      timestamp: event.timestamp,
    })),
  });
}
