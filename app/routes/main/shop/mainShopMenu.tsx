import { FC, Dispatch, SetStateAction } from "react";
import { lng } from "~/data/lang";

const MainShopMenu:FC<{
    lang:string;
    state:string;
    setSelected:Dispatch<SetStateAction<string>>;
    setSelectedModule:Dispatch<SetStateAction<string>>;
    user:IUser;
    global:IDB;
    setOnBox:Dispatch<SetStateAction<boolean>>;
}> = ({
    lang,
    state,
    setSelected,
    setSelectedModule,
    user,
    global,
    setOnBox
}) => {
    return <div className='w-full h-full flex flex-row gap-2 flex-wrap items-center justify-center overflow-y-auto p-5'>
        {
            state == "units" ?
            global.units.filter(v => !v.private).map((v, i) => {
                const isUnlocked = user.unlocked.includes(v.type)
                return <div key={i} className={`${isUnlocked ? "f-backwl" : "f-backbl"} s-0-9 bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24`}
                style={{backgroundImage:`url(assets/units/${v.type}.png)`}}
                onClick={e => setSelected(v.type)}>
                    {!isUnlocked && <div
                    className="w-full h-full flex flex-col justify-center items-center rounded-md text-white text-sm lg:text-xl font-bold">{v.buy}</div>}
                </div>
            }): state == "modules" ?
            global.modules.filter(v => !v.private).sort((a, b) => {
                const aName = a.type.split('-')[0]
                const bName = b.type.split('-')[0]
                if(aName < bName) return -1
                if(aName > bName) return 1
                return a.quality - b.quality
            }).map((v, i) => {
                const isUnlocked = user.unlockedModules.includes(v.type)
                return <div key={i} className={`${isUnlocked ? "f-backwl" : "f-backbl"} s-0-9 bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24`}
                style={{backgroundImage:`url(assets/modules/${v.type.split('-')[0]}.png)`}}
                onClick={e => setSelectedModule(v.type)}>
                    {!isUnlocked ? <div
                    className="w-full h-full flex flex-col justify-center items-center rounded-md text-white text-sm lg:text-xl font-bold">
                        <img src="assets/icons/lock.svg" alt="" className="w-8 lg:w-12" />
                    </div>: <div className="w-full h-full flex flex-col justify-center items-center text-white text-2xl lg:text-4xl font-bold"
                    >{v.type.split('-')[1].toUpperCase()}</div>}
                </div>
            }): <></>
        }
        {state == "modules" && <div className="f-backwl s-0-8 rounded-md w-16 h-16 lg:w-24 lg:h-24 cursor-pointer bg-cover bg-center flex flex-col justify-center items-center text-4xl lg:text-6xl font-bold text-center" onClick={e => setOnBox(true)}>+</div>}
    </div>
}

export default MainShopMenu;