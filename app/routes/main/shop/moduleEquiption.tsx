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
    return <>Need To Make Here</>
}

export default ModuleEquiption;