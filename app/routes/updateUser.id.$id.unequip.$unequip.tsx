import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id, unequip} = params;
  let res = null;
  const user = await getUser('id', id as string);
  const mod = unequip == 'unit' ? {equipped: user.equipped.map(v => '')} : {equippedModules: user.equippedModules.map(v => ['', ''])}
  res = await updateUser(id as string, mod);
  return json({res});
}
