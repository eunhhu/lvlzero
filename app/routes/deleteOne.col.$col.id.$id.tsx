import { LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteOne, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {col, id} = params;
  let res = null;
  res = await deleteOne(col as string, id as string);
  return json({res});
}
