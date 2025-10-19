import { defineApp } from "convex/server";
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config";

const app = defineApp();

// Install persistent text streaming component
app.use(persistentTextStreaming);

export default app;
