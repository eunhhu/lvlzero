import { LoaderFunction, json } from "@remix-run/node";
import { getBy, updateBy } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id,uid} = params;
  let res = null;
  // clan apply
  const user = await getBy('users', {id:uid})
  if(!user) return json({res: null})
  if(user.clan) return json({res: null})
  const clan = await getBy('clans', {id})
  if(!clan) return json({res: null})
  if(clan.pending.includes(uid)) return json({res: null})
  clan.pending.push(uid)
  await updateBy('clans', {id:clan.id}, {pending: clan.pending})
  res = true
  return json({res});
}
