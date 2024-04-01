import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";

export const loader:LoaderFunction = async ({params}) => {
    const {id, level, wave, maxwave, clear} = params;
    let res = null;
    const user = await getUser('id', id as string);
    const waveProgress = parseInt(wave as string) / parseInt(maxwave as string);
    const isClear = clear === 'true';
    const rewardMount = Math.floor(parseInt(level as string) * 50 * waveProgress * (isClear ? 1 : 0.5));
    if(isNaN(rewardMount)) return json({res: null});
    const curMaxExp = 100 + user.lvl ** 2 * 10;
    let exp = user.exp + rewardMount;
    let lvl = user.lvl;
    if (exp >= curMaxExp) {
        exp -= curMaxExp;
        lvl += 1;
    }
    let upd:{} = {gold: user.gold + rewardMount, exp, lvl};
    res = await updateUser(id as string, upd);
    return json({res});
}
