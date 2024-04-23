import {FC, Dispatch, SetStateAction, useState} from 'react'
import { lng } from '~/data/lang';
import Title from './unitInfo_title';
import UnitProfile from './unitInfo_unitProfile';
import UnitContents from './unitInfo_unitContents';

const UnitInfo:FC<{
    user:IUser;
    setUser:Dispatch<SetStateAction<IUser>>;
    lang:string;
    selected:string;
    setSelected:Dispatch<SetStateAction<string>>;
    setIsFetching:Dispatch<SetStateAction<boolean>>;
    isFetching:boolean;
    global:IDB;
}> = ({
    user,
    setUser,
    lang,
    selected,
    setSelected,
    setIsFetching,
    isFetching,
    global
}) => {
    const [lvl, setLvl] = useState<number>(0)
    const [error, setError] = useState<string>('')

    const success = (res:IUser) => {
        setIsFetching(false)
        setError('')
        setSelected('')
        setUser(res)
    }

    return <div className="fixed w-full h-full bg-[#00000099] fccc"
    onClick={e => {
        if(e.target != e.currentTarget) return
        setError('')
        setSelected('')
    }}>
        <div className="f-back2l s-0-9 fccc" style={{width:'80%', height:'80%'}}>
            <div className="w-full h-full fccc">
                <Title lang={lang} selected={selected} lvl={lvl} setLvl={setLvl} global={global} />
                <div className='flex-1 frac w-full'>
                    <UnitProfile lang={lang} selected={selected} />
                    <UnitContents lang={lang} selected={selected} lvl={lvl} global={global} />
                </div>
                {error && <div className="text-red-500 font-bold text-sm lg:text-lg noshadow">{lng(lang, error)}</div>}
            </div>
            <div className='frcc gap-2 lg:gap-3 w-full'>
                <button disabled={isFetching} className='f-btn f-out f-mc s-0-6 text-md lg:text-xl'
                onClick={e => {
                    setError('')
                    const curIdx = global.units.findIndex(v => v.type == selected)
                    if(curIdx == 0) return
                    setSelected(global.units[curIdx-1].type)
                }}>&lt;</button>
                <button disabled={isFetching} className="flex-1 f-btn f-out f-mc s-0-6 w-full p-1 lg:p-2 text-md lg:text-xl"
                onClick={e => {
                    setError('')
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
                <button disabled={isFetching} className='f-btn f-out f-mc s-0-6 text-md lg:text-xl'
                onClick={e => {
                    setError('')
                    const curIdx = global.units.findIndex(v => v.type == selected)
                    if(curIdx == global.units.length-1) return
                    setSelected(global.units[curIdx+1].type)
                }}>&gt;</button>
            </div>
        </div>
    </div>
}

export default UnitInfo;