import {FC, Dispatch, SetStateAction} from 'react'

const EquiptionBar:FC<{
    user:IUser;
    setSelected:Dispatch<SetStateAction<string>>;
    setSelectedModule:Dispatch<SetStateAction<string>>;
}> = ({
    user,
    setSelected,
    setSelectedModule
}) => {
    return <div className="box flex flex-row gap-2 w-full justify-center items-center p-1 lg:p-2">
        {
            user.equipped.map((v, i) => {
                const mod = user.equippedModules[i]
                return <div key={i} className='flex flex-col justify-center items-center gap-1 lg:gap-1.5'>
                    <div className="box bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24"
                    style={{backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}
                    onClick={e => setSelected(v)}>
                        {v == 'l' && <div
                        className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-sm lg:text-xl font-bold">900</div>}
                    </div>
                    <div className='flex flex-row justify-center items-center gap-1 lg:gap-1.5'>
                        <div className='flex-1 box bg-cover bg-center w-6 lg:w-12 h-6 lg:h-12 cursor-pointer flex flex-col justify-center items-center font-bold text-lg lg:text-2xl' style={{
                            backgroundImage: mod[0] ? `url(assets/modules/${mod[0].split('-')[0]}.png)` : "none"
                        }} onClick={e => setSelectedModule(mod[0])}>{mod[0] ? mod[0].split("-")[1].toUpperCase() : ""}</div>
                        <div className='flex-1 box bg-cover bg-center w-6 lg:w-12 h-6 lg:h-12 cursor-pointer flex flex-col justify-center items-center font-bold text-lg lg:text-2xl' style={{
                            backgroundImage: mod[1] ? `url(assets/modules/${mod[1].split('-')[0]}.png)` : "none"
                        }} onClick={e => setSelectedModule(mod[1])}>{mod[1] ? mod[1].split("-")[1].toUpperCase() : ""}</div>
                    </div>
                </div>
            })
        }
    </div>
}

export default EquiptionBar;