import { BackgroundTrpcServer } from "@/trpc/background-trpc-server";

export default defineBackground(() => {
  const trpcServer = new BackgroundTrpcServer();
  trpcServer.register();

  console.log("Hello background!", { id: browser.runtime.id });
});
