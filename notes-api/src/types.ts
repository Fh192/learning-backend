import type { IncomingMessage, ServerResponse } from "node:http";

export type Res = ServerResponse<IncomingMessage> & { req: IncomingMessage; }
export type Req = IncomingMessage