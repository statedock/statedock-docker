import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Actor, StateDockService } from "@statedock/core";
import { createServer } from "@statedock/mcp/server.js";

export async function handleMcpRequest(
  service: StateDockService,
  actor: Actor,
  request: Request,
  publicOrigin?: string,
): Promise<Response> {
  const server = createServer(service, actor, publicOrigin);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  try {
    await server.connect(transport);
    return await transport.handleRequest(request);
  } catch (error) {
    console.error("StateDock MCP request failed", error);
    return new Response(JSON.stringify({ error: "mcp_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await server.close().catch(() => {});
    await transport.close().catch(() => {});
  }
}
