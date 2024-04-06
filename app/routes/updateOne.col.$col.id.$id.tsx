import { LoaderFunction, json } from "@remix-run/node";
import { updateOne } from "./lib/api";

export const action: LoaderFunction = async ({ params, request }) => {
  let { col, id } = params
  let obj = await request.json()
  let res = await updateOne(col as string, id as string, obj)
  return json(res)
}
