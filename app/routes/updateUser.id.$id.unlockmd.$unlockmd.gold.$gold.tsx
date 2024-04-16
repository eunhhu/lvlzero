import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id, unlockmd, gold} = params;
  let res = null;
  const user = await getUser('id', id as string);
  let sub:{} = {gold: user.gold - parseInt(gold as string)}
  let upd:{} = {unlockedModules: [...user.unlockedModules, unlockmd as string]}
  upd = {...upd, ...sub}
  res = await updateUser(id as string, upd);
  return json({res});
}
