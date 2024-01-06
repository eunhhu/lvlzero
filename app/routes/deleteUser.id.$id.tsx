import { LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id} = params;
  let res = null;
  res = await deleteUser(id as string);
  return json({res});
}
