import { LoaderFunction, json } from "@remix-run/node";
import { getBy } from "./lib/api";

export const action:LoaderFunction = async ({params, request}) => {
  const {col} = params;
  const obj = request.json()
  let res = null;
  res = await getBy(col as string, obj as any);
  return json({res});
}
