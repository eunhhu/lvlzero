import {FC, Dispatch, SetStateAction, useState} from 'react'
import { lng } from '~/data/lang'

const ModuleInfo:FC<{
    lang:string;
    selectedModule:string;
    setSelectedModule:Dispatch<SetStateAction<string>>;
    user:IUser;
    setUser:Dispatch<SetStateAction<IUser>>;
    setIsFetching:Dispatch<SetStateAction<boolean>>;
    setOnEquip:Dispatch<SetStateAction<boolean>>;
}> = ({
    lang,
    selectedModule,
    setSelectedModule,
    user,
    setUser,
    setIsFetching,
    setOnEquip
}) => {
    const [error, setError] = useState<string>('')

    return <div className="fixed w-full h-full bg-[#00000099] fccc"
    onClick={e => {
        if(e.target != e.currentTarget) return
        setError('')
        setSelectedModule('')
    }}>
        <div className="f-back2l s-0-9 bg-[#000000aa] fccc" style={{width:'80%', height:'80%'}}>
            <div className='flex-1 fccc gap-2 lg:gap-5'>
                <div className='w-full text-lg lg:text-4xl font-bold text-white text-center'>{lng(lang, selectedModule)}</div>
                <div className='bg-cover bg-center w-24 h-24 lg:w-48 lg:h-48' style={{backgroundImage:`url(assets/modules/${selectedModule.split('-')[0]}.png)`}}></div>
                <div className='text-md lg:text-xl text-center text-white font-semibold'>{lng(lang, `${selectedModule}-desc`)}</div>
                <p className='text-sm lg:text-md text-red-500 font-semibold'>{lng(lang, error)}</p>
            </div>
            {user.unlockedModules.includes(selectedModule) && <button className='f-btn f-out f-mc s-0-6 w-full p-1 lg:p-2 text-md lg:text-xl'
            onClick={e => {
                if(user.equippedModules.flat().includes(selectedModule)){
                    const idx = user.equippedModules.findIndex(v => v.includes(selectedModule))
                    setIsFetching(true)
                    fetch(`/updateUser/id/${user.id}/md/${selectedModule}/i/${idx}`).then(res => res.json()).then((res:{res:IUser}) => {
                        if(!res.res) return setError('something went wrong')
                        setIsFetching(false)
                        setSelectedModule('')
                        setUser(res.res)
                    })
                } else {
                    setOnEquip(true)
                }
            }}
            >{user.equippedModules.flat().includes(selectedModule) ?
            lng(lang, "unequip") : lng(lang, "equip")}</button>}
        </div>
    </div>
}

export default ModuleInfo;