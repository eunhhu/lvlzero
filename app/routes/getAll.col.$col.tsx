import { LoaderFunction, json } from "@remix-run/node";
import { getAll } from "./lib/api";

export const action: LoaderFunction = async ({ params }) => {
  let { col } = params
  let res = await getAll(col as string)
  return json(res)
}
