import { z } from "zod";

const SERPER_API_KEY = process.env.SERPER_API_KEY?.replace(/\s/g, "");

const SerperResultSchema = z.object({
  organic: z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string().optional(),
    position: z.number(),
  })).optional(),
});

export type SerpResult = {
  url: string;
  title: string;
  snippet: string;
  position: number;
};

/**
 * Searches Google via Serper.dev and returns top 10 organic results.
 * Cost: ~$0.001 per query.
 */
export async function searchGoogle(keyword: string): Promise<SerpResult[]> {
  if (!SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY not configured");
  }

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: keyword,
      num: 10,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Serper API error ${res.status}: ${text}`);
  }

  const data = SerperResultSchema.parse(await res.json());

  return (data.organic ?? []).map((r) => ({
    url: r.link,
    title: r.title,
    snippet: r.snippet ?? "",
    position: r.position,
  }));
}
