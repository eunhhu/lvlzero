import { LoaderFunction, json } from "@remix-run/node";
import { getBy, updateBy } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id,uid} = params;
  let res = null;
  // accept member
  const user = await getBy('users', {id:uid})
  if(!user) return json({res: null})
  if(user.clan != "") return json({res: null})
  const clan = await getBy('clans', {id})
  if(!clan) return json({res: null})
  if(!clan.pending.includes(uid)) return json({res: null})
  const members = clan.members.concat(uid)
  const pending = clan.pending.filter((m:string) => m !== uid)
  await updateBy('clans', {id:clan.id}, {members, pending})
  await updateBy('users', {id:uid}, {clan: id})
  res = await getBy('clans', {id})
  return json({res});
}
