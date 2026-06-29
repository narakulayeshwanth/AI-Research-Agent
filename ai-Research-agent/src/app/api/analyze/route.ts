import { investmentGraph } from "@/graph/investmentGraph";
import type { ResearchState } from "@/types/investment";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for Vercel Pro, adjust for free tier

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const company = body?.company?.trim();

    if (!company || company.length < 1) {
      return Response.json(
        { success: false, error: "Company name is required." },
        { status: 400 }
      );
    }

    if (company.length > 100) {
      return Response.json(
        { success: false, error: "Company name too long." },
        { status: 400 }
      );
    }

    // Create a ReadableStream for SSE — streams progress as each agent completes
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(payload));
        };

        try {
          send("start", { company, message: "Starting analysis..." });

          const initialState: ResearchState = {
            company,
            completedAgents: [],
          };

          // Stream the graph execution, emitting progress after each node
          const graphStream = await investmentGraph.stream(initialState, {
            streamMode: "updates",
          });

          let finalState: ResearchState = initialState;

          for await (const update of graphStream) {
            // update is { nodeName: partialState }
            const [nodeName, partialState] = Object.entries(update)[0] as [string, Partial<ResearchState>];

            // Merge into final state
            finalState = { ...finalState, ...partialState };

            // Send progress event
            send("agent_complete", {
              agent: nodeName,
              completedAgents: finalState.completedAgents,
              data: partialState,
            });
          }

          // Send final complete event
          send("complete", {
            success: true,
            data: finalState,
          });

          controller.close();
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Analysis failed. Please try again.";
          send("error", { success: false, error: message });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return Response.json(
      { success: false, error: "Invalid request format." },
      { status: 400 }
    );
  }
}
