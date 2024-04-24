import { LoaderFunction, json } from "@remix-run/node";
import { createOne, getBy, getUser, updateUser } from "./lib/api";

const clanPrice = 5000;

export const action:LoaderFunction = async ({params, request}) => {
    const {id} = params
    const obj = request.json() as any
    const name:string = obj.name
    const icon:string = obj.icon
    const master:string = id as string
    let res = null;
    const search = await getBy('clans', {name})
    if(search) return json({res: null});
    const user = await getUser('id', master)
    if(!user) return json({res: null})
    if(user.gold < clanPrice) return json({res: null})
    console.log(search, user)
    const cid = `${Date.now()}`
    const newClan:IClan = {
        id:cid,
        name, icon,
        description: "",
        level: 1,
        exp: 0,
        gold: 0,
        master, submasters:[], members:[master],
        unlocked: [],
        win: 0,
        lose: 0,
        rate: 0,
        private: false
    }
    await createOne("clans", newClan);
    res = await updateUser(user.id, {clan:cid, gold: user.gold - clanPrice})
    return json({res});
}