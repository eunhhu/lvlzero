import { LoaderFunction, json } from "@remix-run/node";
import { getBy, updateUser, updateOne, updateBy } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
  const {id} = params;
  let res = null;
  // leave clan
  const user = await getBy('users', {id})
  if(!user) return json({res: null})
  if(!user.clan) return json({res: null})
  const clan = await getBy('clans', {id: user.clan})
  if(!clan) return json({res: null})
  const members = clan.members.filter((m:string) => m !== id as string)
  const submasters = clan.submasters.filter((m:string) => m !== id as string)
  await updateUser(user.id, {clan: ""})
  await updateBy('clans', {id:clan.id}, {members, submasters})
  res = await getBy('users', {id})
  return json({res});
}
