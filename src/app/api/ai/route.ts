import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, data } = body;

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
        }

        if (action === "investor-match") {
            const { industry, ticketSizeMin, ticketSizeMax, geographies, dealName } = data;

            // Fetch all existing organizations from DB
            const allOrgs = await prisma.organization.findMany({
                select: {
                    id: true,
                    name: true,
                    type: true,
                    industry: true,
                    description: true,
                    website: true,
                    city: true,
                    country: true,
                    ticketSizeMin: true,
                    ticketSizeMax: true,
                    aum: true,
                    revenue: true
                },
                where: {
                    // Optional: Filter basics if needed, but AI does better semantic matching
                    // type: { in: ["PE_FUND", "BUYER", "VC", "OTHER"] } 
                }
            });

            // Limit payload size if necessary (e.g., max 50-100 relevant candidates if we had semantic search)
            // For now, we send all (assuming < 200 relevant orgs).
            const candidates = JSON.stringify(allOrgs.map(o => ({
                id: o.id,
                name: o.name,
                type: o.type,
                industry: o.industry,
                desc: o.description ? o.description.substring(0, 200) : "", // Truncate desc to save tokens
                web: o.website,
                loc: `${o.city || ''} ${o.country || ''}`.trim(),
                ticket: o.ticketSizeMin ? `${o.ticketSizeMin}-${o.ticketSizeMax}` : null
            })));

            const prompt = `Du bist ein exzellenter M&A-Berater.
Deine Aufgabe: Identifiziere aus der folgenden LISTE VON EXISTIERENDEN ORGANISATIONEN die besten Käufer/Investoren für den unten beschriebenen Deal.

Nutze Web Search, um die Websites der Kandidaten zu besuchen und deren aktuellen Fokus zu prüfen, falls die Datenbank-Infos nicht reichen.

DEAL DETAILS:
Name: ${dealName || "Unbekannt"}
Branche: ${industry || "Nicht spezifiziert"}
Ticketgröße: ${ticketSizeMin ? `${ticketSizeMin / 1000000}M` : "?"} - ${ticketSizeMax ? `${ticketSizeMax / 1000000}M` : "?"} EUR
Geographien: ${geographies?.join(", ") || "DACH"}

KANDIDATEN-LISTE (Wähle NUR aus dieser Liste!):
${candidates}

ANWEISUNG:
1. Wähle die Top 5-10 passenden Organisationen aus der Liste.
2. Antworte AUSSCHLIESSLICH mit einem JSON-Array.
3. Jedes Objekt im Array MUSS folgende Felder haben:
- id (Die ID aus der Kandidaten-Liste)
- name (Exakt der Name aus der Liste)
- type (Typ aus der Liste)
- reasoning (Warum passen sie genau zu DIESEM Deal? Mache das spezifisch.)
- website (URL aus der Liste oder gefunden per Web Search)

Beispiel-Output:
[
  { "id": "clk...", "name": "Beispiel Cap", "type": "PE_FUND", "reasoning": "Passt weil...", "website": "..." }
]`;

            const response = await fetch("https://api.openai.com/v1/responses", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-5-mini-2025-08-07",
                    reasoning: { effort: "low" },
                    tools: [{ type: "web_search" }],
                    input: prompt
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                return NextResponse.json({ error: `AI-Anfrage fehlgeschlagen: ${response.status} - ${err.substring(0, 200)}` }, { status: 500 });
            }

            const result = await response.json();

            // Extract content logic (same as before)
            let content = "";
            if (Array.isArray(result)) {
                const messageItem = result.find((item: any) => item.type === "message");
                content = messageItem?.content?.[0]?.text || "";
            } else {
                content = result.output_text || "";
                if (!content && result.output && Array.isArray(result.output)) {
                    const messageItem = result.output.find((item: any) => item.type === "message");
                    if (messageItem && messageItem.content) {
                        const textPart = messageItem.content.find((part: any) => part.type === "output_text" || part.type === "text");
                        content = textPart?.text || textPart?.output_text || "";
                    }
                }
                if (!content) content = result.content || "";
            }

            let investors = [];
            try {
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    investors = JSON.parse(jsonMatch[0]);
                } else if (content.trim()) {
                    investors = JSON.parse(content);
                }
            } catch (e) {
                console.error("JSON Parse Error:", e, content);
                investors = [];
            }

            return NextResponse.json({ investors, rawResponse: content });
        }

        if (action === "org-from-website") {
            const { websiteUrl } = data;

            const prompt = `Recherchiere das Unternehmen hinter dieser Website: ${websiteUrl}

Extrahiere folgende Informationen für ein M&A-Longlist-Profil.
Antworte AUSSCHLIESSLICH mit einem JSON-Objekt.
Fülle ALLE Felder aus. Wenn eine Information nicht zu finden ist, nutze null.

Regeln für Finanzdaten:
1. Wenn Typ = "BUYER" (Stratege):
   - Fülle 'revenue' (Letzter Jahresumsatz in EUR)
   - Fülle 'ebitda' (Operatives Ergebnis in EUR)
   - Fülle 'employees' (Anzahl Mitarbeiter)
   - Lasse 'aum', 'ticketSizeMin', 'ticketSizeMax' als null (außer es ist explizit bekannt)
2. Wenn Typ = "PE_FUND" (Private Equity):
   - Fülle 'aum' (Assets under Management in EUR)
   - Fülle 'ticketSizeMin'/'ticketSizeMax' (Equity Ticket pro Deal in EUR)
   - Lasse 'revenue' als null (Portfolioumsatz ist hier Irrelevant)

{
  "name": "Firmenname",
  "industry": "Branche (auf Deutsch)",
  "description": "Kurzbeschreibung für M&A-Kontext (Geschäftsmodell, Fokus, 2-3 Sätze)",
  "city": "Stadt",
  "country": "Land",
  "type": "BUYER | PE_FUND (Nutze NUR diese beiden Werte: BUYER für alle Firmen/Strategen, PE_FUND für alle Finanzinvestoren/Private Equity)",
  "website": "${websiteUrl}",
  "revenue": Zahl in EUR (oder null),
  "ebitda": Zahl in EUR (oder null),
  "employees": Zahl (oder null),
  "ticketSizeMin": Zahl in EUR (oder null),
  "ticketSizeMax": Zahl in EUR (oder null),
  "aum": Zahl in EUR (oder null),
  "geographies": ["Liste", "der", "Zielregionen"],
  "foundingYear": Zahl (oder null)
}`;

            const response = await fetch("https://api.openai.com/v1/responses", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-5-mini-2025-08-07",
                    reasoning: { effort: "low" },
                    tools: [{ type: "web_search" }],
                    input: prompt
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                console.error("Responses API Error (org-from-website):", response.status, err);
                return NextResponse.json({ error: `AI-Recherche fehlgeschlagen: ${response.status} - ${err.substring(0, 200)}` }, { status: 500 });
            }

            const result = await response.json();

            let content = "";
            if (Array.isArray(result)) {
                const messageItem = result.find(item => item.type === "message");
                content = messageItem?.content?.[0]?.text || "";
            } else {
                content = result.output_text || "";
                if (!content && result.output && Array.isArray(result.output)) {
                    const messageItem = result.output.find((item: any) => item.type === "message");
                    if (messageItem && messageItem.content) {
                        const textPart = messageItem.content.find((part: any) => part.type === "output_text" || part.type === "text");
                        content = textPart?.text || textPart?.output_text || "";
                    }
                }
                if (!content) content = result.content || "";
            }

            if (!content) {
                console.log("Full AI Response for debugging:", JSON.stringify(result, null, 2));
            }

            let orgData = null;
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    orgData = JSON.parse(jsonMatch[0]);
                } else if (content.trim()) {
                    orgData = JSON.parse(content);
                }
            } catch (e) {
                console.error("JSON Parse Error:", e, content);
                orgData = null;
            }

            return NextResponse.json({ orgData, rawResponse: content });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (error: any) {
        console.error("AI API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
