import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";
import { getLvl, getTotalExp } from "~/data/utils";

export const loader:LoaderFunction = async ({params}) => {
    const {id, level, wave, maxwave, clear} = params;
    let res = null;
    const user = await getUser('id', id as string);
    const waveProgress = parseInt(wave as string) / parseInt(maxwave as string);
    const isClear = clear === 'true';
    const rewardMount = Math.floor(parseInt(level as string) * 50 * waveProgress * (isClear ? 1 : 0.5)) + 100;
    if(isNaN(rewardMount)) return json({res: null});
    let exp = user.exp + rewardMount;
    let lvl = user.lvl;
    const totalExp = getTotalExp(lvl-1) + exp;
    const pLvl = getLvl(totalExp)
    console.log(lvl, exp, totalExp, getTotalExp(lvl-1), pLvl);
    if(pLvl > lvl){
        lvl = pLvl;
        exp = totalExp - getTotalExp(pLvl-1);
    };
    let upd:{} = {gold: user.gold + rewardMount, exp, lvl};
    res = await updateUser(id as string, upd);
    return json({res, reward: rewardMount});
}
