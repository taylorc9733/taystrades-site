import { getListings, findItem, similar } from "../../../shared/store.js";

export async function onRequestGet({ env, params }) {
  const data = await getListings(env);
  const item = findItem(data, params.id);
  if (item) return Response.json({ item }, { headers: { "cache-control": "public, max-age=60" } });
  const sold = (data.ended || []).find((e) => String(e.id) === String(params.id)) || { id: params.id };
  return Response.json({ sold }, { headers: { "cache-control": "public, max-age=60" } });
}
