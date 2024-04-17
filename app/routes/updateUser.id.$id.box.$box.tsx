import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getAllDB, getUser, updateUser } from "./lib/api";

const getRandomOne = (modules:IModule[], quality:number) => {
  const all = modules.filter(v => v.quality == quality)
  const rand = Math.floor(Math.random() * all.length)
  return all[rand].type;
}

export const loader:LoaderFunction = async ({params}) => {
  const {id, box} = params;
  let res = null;
  const modules = (await getAllDB()).modules;
  const user = await getUser('id', id as string);
  let mod:string = '';
  let cost:number = 0;
  switch(box){
    case 'iron':
      cost = 1000;
      mod = getRandomOne(modules, 0);
      break;
    case 'gold':
      cost = 1500;
      mod = getRandomOne(modules, 1);
      break;
    case 'diamond':
      cost = 2000;
      mod = getRandomOne(modules, 2);
      break;
    case 'ruby':
      cost = 2500;
      mod = getRandomOne(modules, 3);
      break;
    case 'obsidian':
      cost = 3000;
      mod = getRandomOne(modules, 4);
      break;
  }
  if(user.gold < cost) return json({message: 'not enough gold'});
  let sub:{} = {gold: user.gold - cost}
  let upd:{} = {unlockedModules: [...user.unlockedModules, mod]}
  if(user.unlockedModules.includes(mod)) upd = {}
  upd = {...upd, ...sub}
  res = await updateUser(id as string, upd);
  return json({res, mod});
}