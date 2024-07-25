import type { JsonRpcParams, Json } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import { UNSUPPORTED_RPC_METHODS } from '../../../../shared/constants/network';

/**
 * Creates a middleware that rejects explicitly unsupported RPC methods with the
 * appropriate error.
 */
export function createUnsupportedMethodMiddleware<
  Params extends JsonRpcParams,
  Result extends Json,
>(): JsonRpcMiddleware<Params, Result> {
  return async function unsupportedMethodMiddleware(req, _res, next, end) {
    if ((UNSUPPORTED_RPC_METHODS as Set<string>).has(req.method)) {
      return end(ethErrors.rpc.methodNotSupported());
    }
    return next();
  };
}
