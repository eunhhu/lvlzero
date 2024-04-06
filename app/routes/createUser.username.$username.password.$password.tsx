import { LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";
import { sha256 } from "~/data/utils";

export const loader:LoaderFunction = async ({params}) => {
    const {username, password} = params;
    let res = null;
    const search = await getUser('username', username as string)
    if(search) return json({res: null});
    const newUser:IUser = {
        username:username as string,
        password:sha256(password as string),
        id: `${Date.now()}`,
        gold: 0,
        lvl: 1,
        exp: 0,
        admin: false,
        banned: false,
        unlocked: ['stone-catapult', 'mini-cannon', 'auto-turret', 'ballista'],
        equipped: ['stone-catapult', 'mini-cannon', 'auto-turret', 'ballista', 'l', 'l'],
        avatar: 'default',
        win: 0,
        lose: 0,
        lastPvp: -1
    }
    res = await createUser(newUser);
    return json({res:newUser});
}