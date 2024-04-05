import { LoaderFunction, json } from "@remix-run/node";
import { updateOne } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {col, id, type, value} = params;
  let res = null;
  res = await updateOne(col as string, id as string, type as string, value as string);
  return json({res});
}
