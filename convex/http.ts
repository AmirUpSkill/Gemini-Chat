import { httpRouter } from "convex/server";
import { streamChat } from "./messages";

const http = httpRouter();

http.route({
  path: "/chat-stream",
  method: "POST",
  handler: streamChat,
});

export default http;
