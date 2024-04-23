import {FC, Dispatch, SetStateAction} from 'react'
import { lng } from '~/data/lang';

const ModuleEquiption:FC<{
    user:IUser;
    setUser:Dispatch<SetStateAction<IUser>>;
    lang:string;
    selectedModule:string;
    setIsFetching:Dispatch<SetStateAction<boolean>>;
    setOnEquip:Dispatch<SetStateAction<boolean>>;
}> = ({
    user,
    setUser,
    lang,
    selectedModule,
    setIsFetching,
    setOnEquip
}) => {
    return <div className="fixed w-full h-full bg-[#00000099] fccc"
    onClick={e => {
        if(e.target != e.currentTarget) return
        setOnEquip(false)
    }}>
        <div className="f-back2l s-0-9 frcc gap-2 lg:gap-3 w-[90%] h-[40%] min-h-24 lg:min-h-48">
            {user.equippedModules.map((slot, i) => {
                const isLocked = user.equipped.map((v, i) => [v, i]).filter(v => v[0] == 'l').find(v => v[1] == i) ? true : false
                return <div key={i} className='fccc gap-1 lg:gap-1.5'>
                    <div className='frcc gap-1 lg:gap-1.5'>
                        {slot.map((md, j) => {
                            const classer = md.split('-')[1];
                            return <div key={j} className='f-backl s-0-9 w-12 h-12 lg:w-16 lg:h-16 bg-cover bg-center text-lg lg:text-xl fccc font-bold' style={{
                                backgroundImage: md ? `url(assets/modules/${md.split('-')[0]}.png)` : 'none',
                            }}>{classer ? classer.toUpperCase() : ""}</div>
                        })}
                    </div>
                    <button disabled={isLocked} className={`f-btn f-out f-mc s-0-7 w-full p-1 lg:p-2 text-sm lg:text-md ${isLocked ? "text-red-500" : ""}`} onClick={e => {
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/md/${selectedModule}/i/${i}`).then(res => res.json()).then((res:{res:IUser}) => {
                            setIsFetching(false)
                            if(res.res){
                                setUser(res.res)
                                setOnEquip(false)
                            }
                        })
                    }}
                    >{lng(lang, "equip")}</button>
                </div>
            })}
        </div>
    </div>
}

export default ModuleEquiption;