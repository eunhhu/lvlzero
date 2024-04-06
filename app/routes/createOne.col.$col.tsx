import { LoaderFunction, json } from "@remix-run/node";
import { createOne } from "./lib/api";

export const action: LoaderFunction = async ({ params, request }) => {
  let { col } = params
  let obj = await request.json()
  console.log(obj)
  let res = await createOne(col as string, obj)
  return json(res)
}
