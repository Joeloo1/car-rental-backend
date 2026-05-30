import { AsyncLocalStorage } from "async_hooks";

type RequestContext = { requestId: string };

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestId = (): string => requestContext.getStore()?.requestId ?? "-";
