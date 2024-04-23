import {FC, Dispatch, SetStateAction} from 'react'
import { lng } from '~/data/lang';

const EquiptionBar:FC<{
    lang:string;
    user:IUser;
    setUser:Dispatch<SetStateAction<IUser>>;
    setSelected:Dispatch<SetStateAction<string>>;
    setSelectedModule:Dispatch<SetStateAction<string>>;
    isFetching:boolean;
    setIsFetching:Dispatch<SetStateAction<boolean>>;
}> = ({
    lang,
    user,
    setUser,
    setSelected,
    setSelectedModule,
    isFetching,
    setIsFetching
}) => {
    return <div className="f-backl s-0-9 frcc gap-2 w-full p-1 lg:p-2">
        {
            user.equipped.map((v, i) => {
                const mod = user.equippedModules[i]
                return <div key={i} className='fccc gap-1 lg:gap-1.5'>
                    <div className="f-backwl s-0-9 bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24"
                    style={{backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}
                    onClick={e => setSelected(v)}>
                        {v == 'l' && <div
                        className="w-full h-full fccc rounded-md bg-[#00000077] text-white text-sm lg:text-xl font-bold">900</div>}
                    </div>
                    <div className='frcc gap-1 lg:gap-1.5'>
                        {mod.map((mod, i) => {
                            return <div key={i} className='flex-1 f-backwl s-0-7 bg-cover bg-center w-8 lg:w-12 h-8 lg:h-12 cursor-pointer fccc font-bold text-lg lg:text-2xl' style={{
                                backgroundImage: mod ? `url(assets/modules/${mod.split('-')[0]}.png)` : "none"
                            }} onClick={e => setSelectedModule(mod)}>{mod ? mod.split("-")[1].toUpperCase() : ""}</div>
                        })}
                    </div>
                </div>
            })
        }
        <div className='fcac h-full'>
            <button disabled={isFetching} onClick={e => {
                setIsFetching(true)
                fetch(`/updateUser/id/${user.id}/unequip/unit`).then(res => res.json()).then((res:{res:IUser}) => {
                    setIsFetching(false)
                    if(res.res){
                        setSelected('')
                        setSelectedModule('')
                        setUser(res.res)
                    }
                })
            }} className='f-btn f-out f-mc s-0-7 text-md lg:text-lg'>{lng(lang, 'unequip all units')}</button>
            <button disabled={isFetching} onClick={e => {    
                setIsFetching(true)
                fetch(`/updateUser/id/${user.id}/unequip/module`).then(res => res.json()).then((res:{res:IUser}) => {
                    setIsFetching(false)
                    if(res.res){
                        setSelected('')
                        setSelectedModule('')
                        setUser(res.res)
                    }
                })
            }} className='f-btn f-out f-mc s-0-7 text-md lg:text-lg'>{lng(lang, 'unequip all modules')}</button>
        </div>
    </div>
}

export default EquiptionBar;