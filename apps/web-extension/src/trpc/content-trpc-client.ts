import { createTRPCProxyClient, TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "@/trpc/router";
import {
  isTrpcRuntimeResponse,
  TRPC_RUNTIME_MESSAGE_TYPE,
  type TrpcRuntimeRequest,
  type TrpcRuntimeResponse,
} from "@/trpc/types";

const runtimeMessageLink = (): TRPCLink<AppRouter> => {
  return () => {
    return ({ op }) =>
      observable((observer) => {
        if (op.type === "subscription") {
          observer.error(
            TRPCClientError.from(new Error("Subscriptions are not supported over runtime messages"))
          );
          return () => {
            return;
          };
        }

        const request: TrpcRuntimeRequest = {
          type: TRPC_RUNTIME_MESSAGE_TYPE,
          id: Date.now() + Math.floor(Math.random() * 1_000),
          path: op.path,
          procedureType: op.type,
          input: op.input,
        };

        void browser.runtime
          .sendMessage(request)
          .then((response: unknown) => {
            if (!isTrpcRuntimeResponse(response)) {
              observer.error(TRPCClientError.from(new Error("Invalid tRPC runtime response")));
              return;
            }

            const typedResponse = response as TrpcRuntimeResponse;

            if (typedResponse.error) {
              observer.error(TRPCClientError.from(new Error(typedResponse.error.message)));
              return;
            }

            observer.next({
              context: op.context,
              result: {
                data: typedResponse.result,
              },
            });
            observer.complete();
          })
          .catch((error) => {
            observer.error(TRPCClientError.from(error));
          });

        return () => {
          return;
        };
      });
  };
};

export class ContentTrpcClient {
  private readonly proxyClient = createTRPCProxyClient<AppRouter>({
    links: [runtimeMessageLink()],
  });

  public get client() {
    return this.proxyClient;
  }
}

export const contentTrpcClient = new ContentTrpcClient();