import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id, md, i} = params;
  let res = null;
  const user = await getUser('id', id as string);
  if(!i || !md) return json({res: null}); // i: equip slot index, md: module id
  let eqd = JSON.parse(JSON.stringify(user.equippedModules)) as string[][]; // deep copy
  if(eqd[+i].includes(md as string)){ // if module is already equipped, unequip it
    eqd[+i].splice(eqd[+i].indexOf(md as string), 1) // remove module from equipped modules
  } else if(eqd[+i].length > 2) { // if more than 3 modules are equipped, return error
    return json({message: 'Cannot equip more than 3 modules'}); // return error
  }else { // equip module
    eqd[+i].push(md as string); // add module to equipped modules
  }
  let upd:{} = {equippedModules: eqd}
  res = await updateUser(id as string, upd);
  return json({res});
}
