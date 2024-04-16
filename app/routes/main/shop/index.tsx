import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import StateSelectionBar from './stateSelectionBar'
import MainShopMenu from './mainShopMenu'
import EquiptionBar from './equiptionBar'
import GoldUi from './goldUi'
import UnitInfo from './unitInfo'
import ModuleInfo from './moduleInfo'
import ModuleEquiption from './moduleEquiption'

const ShopState:FC<{lang:string;user:IUser;setUser:Dispatch<SetStateAction<IUser>>;global:IDB}> = ({lang, user, setUser, global}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [selected, setSelected] = useState<string>('') // unit type
    const [selectedModule, setSelectedModule] = useState<string>('') // module type
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [state, setState] = useState<string>("units") // units modules skins
    const [onEquip, setOnEquip] = useState<boolean>(false) // module slot selection
    const [onBox, setOnBox] = useState<boolean>(false) // box selection

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        // here
    }, [once])

    return <div className="flex flex-col justify-center items-center w-full fixed top-0" style={{height: `calc(100% - 76px)`}}>
        <div className='flex flex-row flex-1 w-full'>
            <StateSelectionBar state={state} setState={setState} lang={lang}setSelected={setSelected} />
            <MainShopMenu lang={lang} state={state} setSelected={setSelected} setSelectedModule={setSelectedModule} user={user} global={global} setOnBox={setOnBox} />
        </div>
        <EquiptionBar user={user} setSelected={setSelected} setSelectedModule={setSelectedModule} />
        <GoldUi gold={user.gold} />
        {selected && <UnitInfo user={user} setUser={setUser} lang={lang} selected={selected} setSelected={setSelected} isFetching={isFetching} setIsFetching={setIsFetching} global={global} />}
        {selectedModule && <ModuleInfo user={user} setUser={setUser} lang={lang} selectedModule={selectedModule} setSelectedModule={setSelectedModule} setIsFetching={setIsFetching} setOnEquip={setOnEquip}/>}
        {onEquip && <ModuleEquiption user={user} setUser={setUser} lang={lang} selectedModule={selectedModule} setIsFetching={setIsFetching} setOnEquip={setOnEquip} />}
    </div>
}

export default ShopState