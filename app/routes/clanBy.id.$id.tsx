import { LoaderFunction, json } from "@remix-run/node";
import { getBy, updateBy, updateOne } from "./lib/api";

export const action: LoaderFunction = async ({ params, request }) => {
  let { id } = params
  let req = await request.json() as any
  const one:IClan = await getBy("clans", {id});
  if(!one) return json(null)
  if(one.gold < 5000) return json(null)
  let res = await updateBy("clans", {id}, {...req, gold:one.gold-5000});
  return json(res)
}
