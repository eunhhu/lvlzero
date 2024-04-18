import { Dispatch, FC, SetStateAction } from "react";
import { lng } from "~/data/lang";

const states = ["units", "modules", "skins"]

const StateSelectionBar:FC<{
    state:string;
    setState:Dispatch<SetStateAction<string>>;
    lang:string;
    setSelected:Dispatch<SetStateAction<string>>;
}> = ({
    state,
    setState,
    lang,
    setSelected
}) => {
    return <div className='flex flex-col box p-1 lg:p-2 gap-1 lg:gap-2 justify-start items-center overflow-x-hidden overflow-y-auto w-32 lg:w-48 h-full'>
        {states.map((v, i) => {
            return <div key={i} className={`w-full box text-lg lg:text-xl p-2 lg:p-3 text-center cursor-pointer font-semibold ${state == v ? 'bg-[#ffffff44] hover:bg-[#ffffff55]' : 'hover:bg-[#ffffff11] shadow-inner shadow-white'}`}
            onClick={e => {
                setState(v);
                setSelected('')
            }}
            >
                {lng(lang, v)}
            </div>
        })}
    </div>
}

export default StateSelectionBar;