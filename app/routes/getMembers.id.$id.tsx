import { LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getAllUsers, getMembers, getPendings, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id} = params;
  let res = await getMembers(id as string)
  let pendings = await getPendings(id as string);
  return json({res, pendings});
}
