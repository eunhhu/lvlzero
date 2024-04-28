import { LoaderFunction, json } from "@remix-run/node";
import { updateBy, updateOne } from "./lib/api";

export const action: LoaderFunction = async ({ params, request }) => {
  let { col } = params
  let req = await request.json() as any
  let obj = req.obj
  let newObj = req.newObj
  let res = await updateBy(col as string, obj, newObj)
  return json(res)
}
