import { getReviews } from "../../shared/store.js";

export async function onRequestGet({ env }) {
  return Response.json(await getReviews(env), { headers: { "cache-control": "public, max-age=3600" } });
}
