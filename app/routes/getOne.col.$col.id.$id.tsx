import { LoaderFunction, json } from "@remix-run/node";
import { getOne } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {col, id} = params;
  let res = null;
  res = await getOne(col as string, id as string);
  return json({res});
}
