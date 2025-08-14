import { DifyClient } from "dify-sdk/lib/clients/dify.client";

interface DifyCallOptions {
  query: string;
  inputs: Record<string, any>;
  user: string;
  conversation_id?: string;
  ctx: any;
  onChunkComplete?: (chunk: any) => void;
}

export async function difyCall({
  query,
  inputs,
  user,
  conversation_id,
  ctx,
  onChunkComplete,
}: DifyCallOptions) {
  const baseURL = process.env.DIFFBOT_API_URL as string;
  const apiKey = process.env.DIFFBOT_API_KEY as string;
  const client = new DifyClient({
    apiKey: apiKey,
    baseUrl: baseURL,
  });

  let task_id: string;
  let usingStream: boolean = undefined != ctx.sse;
  const difyQueryData = {
    query,
    inputs,
    user,
    conversation_id,
  };
  console.log("difyQueryData: ...", difyQueryData);
  const result = await client.sendMessage({
    ...difyQueryData,
    response_mode: usingStream ? "streaming" : "blocking",
    chunkCompletionCallback: (chunk) => {
      if (task_id == undefined) {
        task_id = chunk.task_id;
      }
      if (chunk.event == "message" && ctx.sse) {
        console.log("chuck: ...", chunk);
        ctx.sse.send({ event: "message", data: JSON.stringify(chunk) });
      }
      if (chunk.event == "error") {
        console.log("erro chuck: ...", chunk);
        ctx.sse.sendEnd({
          event: "error",
          data: JSON.stringify(chunk),
        });
      }
      onChunkComplete?.(chunk);
    },
  });
  if (usingStream) {
    // 处理客户端断开连接
    ctx.req.on("close", () => {
      client
        .stopMessageResponse({
          task_id: task_id,
          user: user,
        })
        .then(() => {
          console.log("stopMessageResponse succeeded, closing SSE connection.");
          ctx.sse.end(); // 关闭 SSE 连接
        })
        .catch((error) => {
          console.error("Error in stopMessageResponse:", error);
          ctx.sse.end(); // 关闭 SSE 连接
        });
    });

    // 处理错误（可选）
    ctx.req.on("error", (error) => {
      console.error("SSE Error:", error);
      ctx.sse.end();
    });
  }
  return {
    result,
    task_id,
  };
}
