import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id, equip} = params;
  let res = null;
  const user = await getUser('id', id as string);
  let eqd = [...user.equipped]
  if(eqd.includes(equip as string)){
    eqd[eqd.indexOf(equip as string)] = ''
  } else {
    eqd[eqd.indexOf('')] = equip as string
  }
  let upd:{} = {equipped: eqd}
  res = await updateUser(id as string, upd);
  return json({res});
}
