import {FC, Dispatch, SetStateAction} from 'react'

const ModuleEquiption:FC<{
    user:IUser;
    setUser:Dispatch<SetStateAction<IUser>>;
    lang:string;
    selectedModule:string;
    setSelectedModule:Dispatch<SetStateAction<string>>;
    setIsFetching:Dispatch<SetStateAction<boolean>>;
    setOnEquip:Dispatch<SetStateAction<boolean>>;
}> = ({
    user,
    setUser,
    lang,
    selectedModule,
    setSelectedModule,
    setIsFetching,
    setOnEquip
}) => {
    return <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
    onClick={e => {
        if(e.target != e.currentTarget) return
        setOnEquip(false)
    }}>
        <div className="box bg-[#000000aa] flex flex-col w-[60%] h-[20%] min-h-24 lg:min-h-48">
            {user.equippedModules.map((slot, i) => {
                return slot.map((md, j) => {
                    return <div key={`${i}${j}`} className='box w-12 h-24'>d</div>
                    // need to fix here
                })
            })}
        </div>
    </div>
}

export default ModuleEquiption;