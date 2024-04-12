import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id, md, i} = params;
  let res = null;
  const user = await getUser('id', id as string);
  if(!i || !md) return json({res: null});
  let eqd = JSON.parse(JSON.stringify(user.equippedModules)) as string[][];
  if(eqd[+i].includes(md as string)){
    eqd[+i].splice(eqd[+i].indexOf(md as string), 1)
  } else if(eqd[+i].length > 2) {
    return json({message: 'Cannot equip more than 3 modules'});
  }else {
    eqd[+i].push(md as string);
  }
  let upd:{} = {equippedModules: eqd}
  res = await updateUser(id as string, upd);
  return json({res});
}
