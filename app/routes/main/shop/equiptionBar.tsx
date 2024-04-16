import {FC, Dispatch, SetStateAction} from 'react'

const EquiptionBar:FC<{
    user:IUser;
    setSelected:Dispatch<SetStateAction<string>>;
}> = ({
    user,
    setSelected
}) => {
    return <div className="box flex flex-row gap-2 w-full justify-center items-center p-1 lg:p-2">
        {
            user.equipped.map((v, i) => {
                return <div key={i} className="box bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24"
                style={{backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}
                onClick={e => setSelected(v)}>
                    {v == 'l' && <div
                    className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-sm lg:text-xl font-bold">900</div>}
                </div>
            })
        }
    </div>
}

export default EquiptionBar;