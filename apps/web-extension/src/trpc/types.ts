export const TRPC_RUNTIME_MESSAGE_TYPE = "trpc:runtime";

export type TrpcRuntimeProcedureType = "query" | "mutation";

export interface TrpcRuntimeRequest {
  type: typeof TRPC_RUNTIME_MESSAGE_TYPE;
  id: number;
  path: string;
  procedureType: TrpcRuntimeProcedureType;
  input: unknown;
}

export interface TrpcRuntimeError {
  message: string;
}

export interface TrpcRuntimeResponse {
  id: number;
  result?: unknown;
  error?: TrpcRuntimeError;
}

export const isTrpcRuntimeRequest = (value: unknown): value is TrpcRuntimeRequest => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<TrpcRuntimeRequest>;

  return (
    payload.type === TRPC_RUNTIME_MESSAGE_TYPE &&
    typeof payload.id === "number" &&
    typeof payload.path === "string" &&
    (payload.procedureType === "query" || payload.procedureType === "mutation")
  );
};

export const isTrpcRuntimeResponse = (value: unknown): value is TrpcRuntimeResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<TrpcRuntimeResponse>;

  return typeof payload.id === "number";
};