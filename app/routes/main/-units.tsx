import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import { lng } from '~/data/lang'
import { units } from '~/data/db'

const outAttrs = ['type', 'buy', 'tags']
const suffix:{[key:string]:string} = {
    "range":"m",
    "rate":"s",
    "cost":"c",
    "upgradeCost":"c"
}

const UnitsState:FC<{lang:string;user:IUser;setUser:Dispatch<SetStateAction<IUser>>}> = ({lang, user, setUser}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [selected, setSelected] = useState<string>('')
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [lvl, setLvl] = useState<number>(0)

    const displayValue = (attrs:{[key:string]:any}, key:string):string => {
        let result = key == 'cost' ? attrs[key] : attrs[key][lvl];
        if(key == 'rate') result = `${(+result) / 1000}`;
        const suf = Object.entries(suffix).find(v => v[0] == key);
        if(suf) result += suf[1];
        return `${result}`;
    }

    const changeLvl = (n:number) => {
        if(n < 0 && lvl < 1) return;
        const unit = units.find(v => v.type == selected);
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
        <div className="w-full flex flex-row gap-2 flex-wrap items-center justify-center overflow-auto p-5" style={{}}>
            {
                units.map((v, i) => {
                    return <div key={i} className="box bg-cover bg-center cursor-pointer"
                    style={{width:'min(15vw,10vh)', height:'min(15vw,10vh)', backgroundImage:`url(assets/units/${v.type}.png)`}}
                    onClick={e => setSelected(v.type)}>
                        {!user.unlocked.includes(v.type) && <div
                        className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-xl font-bold">{v.buy}</div>}
                    </div>
                })
            }
        </div>
        <div className="absolute bottom-0 flex flex-row gap-2">
            {
                user.equipped.map((v, i) => {
                    return <div key={i} className="box bg-cover bg-center cursor-pointer"
                    style={{width:'min(15vw,10vh)', height:'min(15vw,10vh)', backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}
                    onClick={e => setSelected(v)}>
                        {v == 'l' && <div
                        className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-xl font-bold">900</div>}
                    </div>
                })
            }
        </div>
        <div className="absolute right-0 top-0 box p-2 w-40 text-right">{user.gold}G</div>
        {selected && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return
            setError('')
            setSelected('')
        }}>
            <div className="box bg-[#000000aa] flex flex-col" style={{width:'80%', height:'70%'}}>
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <div className="text-4xl text-white font-bold w-full text-center p-5 flex flex-row items-center justify-around">
                        {selected != 'l' && <button className='pt-0 pb-0 pr-3 pl-3 text-lg' onClick={e => changeLvl(-1)}>&lt;</button>}
                        <div>{selected != 'l' && `Lv.${lvl+1}`} {lng(lang, selected)}</div>
                        {selected != 'l' && <button className='pt-0 pb-0 pr-3 pl-3 text-lg' onClick={e => changeLvl(1)}>&gt;</button>}
                    </div>
                    <div className='flex-1 flex flex-row justify-center items-center'>
                        <div></div>
                        <div className='flex flex-col justify-center items-center'>
                            {selected == 'l' ? <></> : Object.keys(units.find(v => v.type == selected) as {[key:string]:any}).map((v, i) => {
                                if(outAttrs.includes(v)) return null;
                                if(units.find(v => v.type == selected)?.upgradeCost.length as number <= lvl && v == 'upgradeCost') return null;
                                return <div key={i} className="flex flex-row justify-around items-center w-full p-2 text-center">
                                    <div className="flex-1 text-xl text-white font-bold">{lng(lang, v)}</div>
                                    <div className="flex-1 text-xl text-white font-bold">{displayValue(units.find(v => v.type == selected) as {[key:string]:any}, v)}</div>
                                </div>
                            })}
                            {selected !== 'l' && [''].map((v, i) => {
                                let th = (units.find(v => v.type == selected) as {[key:string]:any})
                                let dps = Math.round(th.damage[lvl] / (th.rate[lvl]/1000))
                                return <div key={i} className="flex flex-row justify-around items-center w-full p-2 text-center">
                                    <div className="flex-1 text-xl text-white font-bold">{lng(lang, 'dps')}</div>
                                    <div className="flex-1 text-xl text-white font-bold">{dps}</div>
                                </div>
                            })}
                        </div>
                    </div>
                    {error && <div className="text-red-500 font-bold text-xl noshadow">{lng(lang, error)}</div>}
                </div>
                <button className="text-xl"
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
                    } else if(user.equipped.includes(selected)){
                        // unequip
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/equip/${selected}`).then(res => res.json()).then((res:{res:IUser}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    } else if(user.unlocked.includes(selected)){
                        if(user.equipped.indexOf('') == -1) return setError('no empty slot')
                        // equip
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/equip/${selected}`).then(res => res.json()).then((res:{res:IUser}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    } else {
                        const cost = (units.find(v => v.type == selected) as {[key:string]:any}).buy
                        if(user.gold < cost) return setError('not enough gold')
                        // buy
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/unlock/${selected}/gold/${cost}`).then(res => res.json()).then((res:{res:IUser}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    }
                }}>{
                    selected == 'l' ? `${lng(lang, 'buy')} - 900` : user.equipped.includes(selected) ? lng(lang, 'unequip') :
                    user.unlocked.includes(selected) ? lng(lang, 'equip') :
                    `${lng(lang, 'buy')} - ${units.find(v => v.type == selected)?.buy}`
                }</button>
            </div>
        </div>}
    </div>
}

export default UnitsState