import { LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {type, value} = params;
  let res = null;
  res = await getUser(type as string, value as string);
  return json({res});
}
