/**
 * AppSync resolver that calls the Bedrock Knowledge Base Retrieve API.
 * Knowledge Base ID: YXEDJZHW60
 */
export function request(ctx) {
  const { input } = ctx.args;
  return {
    resourcePath: "/knowledgebases/YXEDJZHW60/retrieve",
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        retrievalQuery: {
          text: input,
        },
      }),
    },
  };
}

export function response(ctx) {
  return JSON.stringify(ctx.result.body);
}
