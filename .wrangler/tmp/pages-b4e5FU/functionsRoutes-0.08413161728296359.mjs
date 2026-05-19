import { onRequestPost as __api_create_checkout_ts_onRequestPost } from "/Users/kenyeh/Desktop/lumen-tarot/functions/api/create-checkout.ts"
import { onRequestPost as __api_reading_ts_onRequestPost } from "/Users/kenyeh/Desktop/lumen-tarot/functions/api/reading.ts"

export const routes = [
    {
      routePath: "/api/create-checkout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_create_checkout_ts_onRequestPost],
    },
  {
      routePath: "/api/reading",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_reading_ts_onRequestPost],
    },
  ]