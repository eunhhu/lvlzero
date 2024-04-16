import { LoaderFunction, json } from "@remix-run/node";
import { modifyAll } from "./lib/api";

export const action: LoaderFunction = async ({ params, request }) => {
  let { col } = params
  let obj = await request.json()
  let res = await modifyAll(col as string, obj)
  return json(res)
}
