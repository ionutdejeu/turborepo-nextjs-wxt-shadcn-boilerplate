import { appRouter } from "@/trpc/router";
import { isTrpcRuntimeRequest, type TrpcRuntimeRequest, type TrpcRuntimeResponse } from "@/trpc/types";

type RouterCaller = ReturnType<typeof appRouter.createCaller>;

export class BackgroundTrpcServer {
  private readonly caller: RouterCaller;
  private isRegistered = false;

  public constructor() {
    this.caller = appRouter.createCaller({});
  }

  public register(): void {
    if (this.isRegistered) {
      return;
    }

    browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
      if (!isTrpcRuntimeRequest(message)) {
        return;
      }

      void this.handleMessage(message).then((response) => {
        sendResponse(response);
      });

      return true;
    });

    this.isRegistered = true;
  }

  private async handleMessage(request: TrpcRuntimeRequest): Promise<TrpcRuntimeResponse> {
    try {
      const procedure = this.resolveProcedure(request.path);
      const result = await procedure(request.input);

      return {
        id: request.id,
        result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown tRPC error";

      return {
        id: request.id,
        error: {
          message,
        },
      };
    }
  }

  private resolveProcedure(path: string): (input: unknown) => Promise<unknown> | unknown {
    const segments = path.split(".");

    const resolved = segments.reduce<unknown>((current, segment) => {
      const currentType = typeof current;
      if (!current || (currentType !== "object" && currentType !== "function")) {
        throw new Error(`Invalid tRPC path: ${path}`);
      }

      const value = (current as Record<string, unknown>)[segment];

      if (typeof value === "undefined") {
        throw new Error(`Unknown tRPC procedure: ${path}`);
      }

      return value;
    }, this.caller as unknown);

    if (typeof resolved !== "function") {
      throw new Error(`Resolved tRPC path is not callable: ${path}`);
    }

    return resolved as (input: unknown) => Promise<unknown> | unknown;
  }
}