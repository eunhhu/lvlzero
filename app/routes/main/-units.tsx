import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import { lng } from '~/data/lang'
import { units } from '~/data/db'

const outAttrs = ['type', 'buy']

const UnitsState:FC<{lang:string;user:IUser;setUser:Dispatch<SetStateAction<IUser>>}> = ({lang, user, setUser}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [selected, setSelected] = useState<string>('')
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

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
                    <div className="text-4xl text-white font-bold w-full text-center p-5">{lng(lang, selected)}</div>
                    {selected == 'l' ? <></> : Object.keys(units.find(v => v.type == selected) as {[key:string]:any}).map((v, i) => {
                        if(outAttrs.includes(v)) return null;
                        return <div key={i} className="flex flex-row justify-around items-center w-full p-2 text-center">
                            <div className="flex-1 text-2xl text-white font-bold">{lng(lang, v)}</div>
                            <div className="flex-1 text-2xl text-white font-bold">{(units.find(v => v.type == selected) as {[key:string]:any})[v]}</div>
                        </div>
                    })}
                    {selected !== 'l' && [''].map((v, i) => {
                        let th = (units.find(v => v.type == selected) as {[key:string]:any})
                        let dps = Math.round(th.damage / (th.rate/1000))
                        return <div key={i} className="flex flex-row justify-around items-center w-full p-2 text-center">
                            <div className="flex-1 text-2xl text-white font-bold">{lng(lang, 'dps')}</div>
                            <div className="flex-1 text-2xl text-white font-bold">{dps}</div>
                        </div>
                    })}
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