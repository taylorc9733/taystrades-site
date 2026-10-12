import { getListings } from "../../shared/store.js";
import { trim } from "../_middleware.js";

export async function onRequestGet({ env }) {
  const data = await getListings(env);
  return Response.json(
    { source: data.source, updatedAt: data.updatedAt, seller: data.seller, items: data.items.map(trim) },
    { headers: { "cache-control": "public, max-age=60" } }
  );
}
