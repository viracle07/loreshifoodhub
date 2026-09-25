import { getPublicPricing } from "@/lib/pricing/service";
export async function GET() {
  try {
    return Response.json(await getPublicPricing(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to refresh prices." }, { status: 503 });
  }
}
