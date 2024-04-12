import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import { lng } from '~/data/lang'

const outAttrs = ['_id', 'type', 'buy', 'tags']
const suffix:{[key:string]:string} = {
    "range":"m",
    "rate":"s",
    "cost":"c",
    "upgradeCost":"c"
}
const states = ["units", "modules", "skins"]

const ShopState:FC<{lang:string;user:IUser;setUser:Dispatch<SetStateAction<IUser>>;global:IDB}> = ({lang, user, setUser, global}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [selected, setSelected] = useState<string>('') // unit type
    const [selectedModule, setSelectedModule] = useState<string>('') // module type
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [lvl, setLvl] = useState<number>(0)
    const [state, setState] = useState<string>("units") // units modules skins

    const displayValue = (attrs:{[key:string]:any}, key:string):string => {
        let result = key == 'cost' ? attrs[key] : attrs[key][lvl];
        if(key == 'rate') result = `${(+result) / 1000}`;
        const suf = Object.entries(suffix).find(v => v[0] == key);
        if(suf) result += suf[1];
        return `${result}`;
    }

    const changeLvl = (n:number) => {
        if(n < 0 && lvl < 1) return;
        const unit = global.units.find(v => v.type == selected);
        if(!unit) return;
        if(n > 0 && lvl >= unit.upgradeCost.length) return;
        setLvl(lvl + n)
    }

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        // here
    }, [once])

    return <div className="flex flex-col justify-center items-center w-full fixed top-0" style={{height: `calc(100% - 76px)`}}>
        <div className='flex flex-row flex-1 w-full'>
            {/* state selection bar */}
            <div className='flex flex-col box p-1 lg:p-2 gap-1 lg:gap-2 justify-start items-center overflow-x-hidden overflow-y-auto w-32 lg:w-48'>
                {states.map((v, i) => {
                    return <div key={i} className={`w-full box text-lg lg:text-xl p-2 lg:p-3 text-center cursor-pointer font-semibold ${state == v ? 'bg-[#ffffff44] hover:bg-[#ffffff55]' : 'hover:bg-[#ffffff11] shadow-inner shadow-white'}`}
                    onClick={e => {
                        setState(v);
                        setLvl(0)
                        setSelected('')
                    }}
                    >
                        {lng(lang, v)}
                    </div>
                })}
            </div>
            {/* main shop menu */}
            <div className='flex-1 w-full flex flex-row gap-2 flex-wrap items-center justify-center overflow-auto p-5'>
                {
                    state == "units" ?
                    global.units.map((v, i) => {
                        return <div key={i} className="box bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24"
                        style={{backgroundImage:`url(assets/units/${v.type}.png)`}}
                        onClick={e => setSelected(v.type)}>
                            {!user.unlocked.includes(v.type) && <div
                            className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-sm lg:text-xl font-bold">{v.buy}</div>}
                        </div>
                    }): state == "modules" ?
                    global.modules.map((v, i) => {
                        return <div key={i} className="box bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24"
                        style={{backgroundImage:`url(assets/modules/${v.type}.png)`}}
                        onClick={e => setSelectedModule(v.type)}>
                            {!user.unlockedModules.includes(v.type) && <div
                            className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000044] text-white text-sm lg:text-xl font-bold">
                                <img src="assets/icons/lock.svg" alt="" className="w-8 lg:w-12" />
                            </div>}
                        </div>
                    }): <></>
                }
            </div>
        </div>
        {/* equipped bar */}
        <div className="box flex flex-row gap-2 w-full justify-center items-center p-1 lg:p-2">
            {
                user.equipped.map((v, i) => {
                    return <div key={i} className="box bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24"
                    style={{backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}
                    onClick={e => setSelected(v)}>
                        {v == 'l' && <div
                        className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-sm lg:text-xl font-bold">900</div>}
                    </div>
                })
            }
        </div>
        {/* gold ui */}
        <div className="absolute right-0 top-0 box p-2 w-40 text-right">{user.gold}G</div>
        {/* unit info windows */}
        {selected && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return
            setError('')
            setSelected('')
        }}>
            <div className="box bg-[#000000aa] flex flex-col" style={{width:'80%', height:'80%'}}>
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <div className="text-lg lg:text-4xl text-white font-bold w-full text-center p-2 lg:p-5 flex flex-row items-center justify-around">
                        {selected != 'l' && <button className='pt-0 pb-0 pr-3 pl-3 text-sm lg:text-lg' onClick={e => changeLvl(-1)}>&lt;</button>}
                        <div>{selected != 'l' && `Lv.${lvl+1}`} {lng(lang, selected)}</div>
                        {selected != 'l' && <button className='pt-0 pb-0 pr-3 pl-3 text-sm lg:text-lg' onClick={e => changeLvl(1)}>&gt;</button>}
                    </div>
                    <div className='flex-1 flex flex-row justify-around items-center w-full'>
                        {selected !== 'l' && <div className='flex-1 flex flex-col justify-center items-center gap-5'>
                            <div className='bg-cover bg-center w-24 h-24 lg:w-48 lg:h-48' style={{backgroundImage:`url(assets/units/${selected}.png)`}}></div>
                            <div className='text-md text-center text-white font-semibold'>{lng(lang, `${selected}-desc`)}</div>
                        </div>}
                        {selected !== 'l' && <div className='flex-1 flex flex-col justify-center items-center mr-4'>
                            {Object.keys(global.units.find(v => v.type == selected) as {[key:string]:any}).map((v, i) => {
                                if(outAttrs.includes(v)) return null;
                                if(global.units.find(v => v.type == selected)?.upgradeCost.length as number <= lvl && v == 'upgradeCost') return null;
                                const max:number = +(global.units as {[key:string]:any}[]).map(v2 => {
                                    return v == 'cost' ? v2[v] : v == 'rate' ? 1000/v2[v][v2.upgradeCost.length] : v2[v][v == 'upgradeCost' ? v2.upgradeCost.length-1 : v2.upgradeCost.length]
                                }).sort((a,b) => b-a)[0];
                                const tar = global.units.find(v => v.type == selected) as {[key:string]:any}
                                const result:number = v == 'cost' ? +tar[v] : v == 'rate' ? 1000/+tar[v][lvl] : +tar[v][lvl]
                                return <div key={i} className="flex flex-row justify-around items-center w-full p-1 lg:p-1.5 text-center">
                                    <div className="flex-1 text-sm lg:text-lg text-white font-bold">{lng(lang, v)}</div>
                                    <div className="flex-1 text-sm lg:text-lg text-white font-bold">{displayValue(tar, v)}</div>
                                    <div className='flex-1'>
                                        <div className='border-2 border-white w-full h-3 lg:h-4 rounded-full'>
                                            <div className={`h-full bg-blue-300 rounded-full text-black`} style={{width: `${result / max * 100}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            })}
                            {[''].map((v, i) => {
                                let th = (global.units.find(v => v.type == selected) as {[key:string]:any})
                                let dps = Math.round(th.damage[lvl] / (th.rate[lvl]/1000))
                                return <div key={i} className="flex flex-row justify-around items-center w-full p-1 lg:p-1.5 text-center">
                                    <div className="flex-1 text-sm lg:text-lg text-white font-bold">{lng(lang, 'dps')}</div>
                                    <div className="flex-1 text-sm lg:text-lg text-white font-bold">{dps}</div>
                                    <div className='flex-1'>
                                        <div className='border-2 border-white w-full h-3 lg:h-4 rounded-full'>
                                            <div className={`h-full bg-blue-300 rounded-full`} style={{width:`${dps / 700 * 100}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            })}
                            {[''].map((v, i) => {
                                let th = (global.units.find(v => v.type == selected) as {[key:string]:any})
                                let drrs = Math.round(th.damage[lvl] / (th.rate[lvl]/1000) * th.range[lvl] * th.bulletSpeed[lvl])
                                return <div key={i} className="flex flex-row justify-around items-center w-full p-1 lg:p-1.5 text-center">
                                    <div className="flex-1 text-sm lg:text-lg text-white font-bold">{lng(lang, 'drrs')}</div>
                                    <div className="flex-1 text-sm lg:text-lg text-white font-bold">{drrs}</div>
                                    <div className='flex-1'>
                                        <div className='border-2 border-white w-full h-3 lg:h-4 rounded-full'>
                                            <div className={`h-full bg-blue-300 rounded-full`} style={{width:`${drrs / 3000 * 100}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            })}
                        </div>}
                    </div>
                    {error && <div className="text-red-500 font-bold text-sm lg:text-lg noshadow">{lng(lang, error)}</div>}
                </div>
                <button className="p-1 lg:p-2 text-md lg:text-xl"
                onClick={e => {
                    setError('')
                    const success = (res:IUser) => {
                        setIsFetching(false)
                        setError('')
                        setSelected('')
                        setUser(res)
                    }
                    if(selected == 'l'){
                        if(user.gold < 900) return setError('not enough gold')
                        // unlock
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/unlock/slot/gold/900`).then(res => res.json()).then((res:{res:IUser}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    } else if(user.equipped.find(v => v == selected)){
                        // unequip
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/equip/${selected}`).then(res => res.json()).then((res:{res:IUser}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    } else if(user.unlocked.includes(selected)){
                        if(user.equipped.findIndex(v => v == '') == -1) return setError('no empty slot')
                        // equip
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/equip/${selected}`).then(res => res.json()).then((res:{res:IUser}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    } else {
                        const cost = (global.units.find(v => v.type == selected) as {[key:string]:any}).buy
                        if(user.gold < cost) return setError('not enough gold')
                        // buy
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/unlock/${selected}/gold/${cost}`).then(res => res.json()).then((res:{res:IUser}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    }
                }}>{
                    selected == 'l' ? `${lng(lang, 'buy')} - 900` : user.equipped.find(v => v == selected) ? lng(lang, 'unequip') :
                    user.unlocked.includes(selected) ? lng(lang, 'equip') :
                    `${lng(lang, 'buy')} - ${global.units.find(v => v.type == selected)?.buy}`
                }</button>
            </div>
        </div>}
        {/* module info window */}
        {selectedModule && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return
            setError('')
            setSelectedModule('')
        }}>
            <div className="box bg-[#000000aa] flex flex-col" style={{width:'80%', height:'80%'}}>
                
            </div>
        </div>}
    </div>
}

export default ShopState