import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id, type, value} = params;
  let res = null;
  if(type === 'username') {
    const search = await getUser('username', value as string);
    if(search && search.id !== id) {
      return json({message: 'username already exists'});
    }
  }
  res = await updateUser(id as string, {[type as string]: value as string});
  return json({res});
}
