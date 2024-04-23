import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import StateSelectionBar from './stateSelectionBar'
import MainShopMenu from './mainShopMenu'
import EquiptionBar from './equiptionBar'
import GoldUi from './goldUi'
import UnitInfo from './unitInfo'
import ModuleInfo from './moduleInfo'
import ModuleEquiption from './moduleEquiption'
import BoxSelection from './boxSelection'

const ShopState:FC<{stateHeight:string;lang:string;user:IUser;setUser:Dispatch<SetStateAction<IUser>>;global:IDB}> = ({stateHeight, lang, user, setUser, global}) => {
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

    return <div className="fccc w-full fixed top-0" style={{height: stateHeight}}>
        <div className='frs flex-1 w-full h-full overflow-hidden'>
            <StateSelectionBar state={state} setState={setState} lang={lang}setSelected={setSelected} />
            <MainShopMenu lang={lang} state={state} setSelected={setSelected} setSelectedModule={setSelectedModule} user={user} global={global} setOnBox={setOnBox} />
        </div>
        <EquiptionBar lang={lang} user={user} setUser={setUser} setSelected={setSelected} setSelectedModule={setSelectedModule} isFetching={isFetching} setIsFetching={setIsFetching} />
        <GoldUi gold={user.gold} />
        {selected && <UnitInfo user={user} setUser={setUser} lang={lang} selected={selected} setSelected={setSelected} isFetching={isFetching} setIsFetching={setIsFetching} global={global} />}
        {selectedModule && <ModuleInfo user={user} setUser={setUser} lang={lang} selectedModule={selectedModule} setSelectedModule={setSelectedModule} isFetching={isFetching} setIsFetching={setIsFetching} setOnEquip={setOnEquip} global={global}/>}
        {onEquip && <ModuleEquiption user={user} setUser={setUser} lang={lang} selectedModule={selectedModule} setIsFetching={setIsFetching} setOnEquip={setOnEquip} isFetching={isFetching} />}
        {onBox && <BoxSelection lang={lang} user={user} setUser={setUser} setOnBox={setOnBox} />}
    </div>
}

export default ShopState