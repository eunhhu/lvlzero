import { LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getAllDB, getAllUsers, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({}) => {
  let res = null;
  res = await getAllDB();
  return json({res});
}
