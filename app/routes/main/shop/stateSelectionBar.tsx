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
    return <div className='flex flex-col f-backl s-0-8 p-1 lg:p-2 gap-1 lg:gap-2 justify-start items-center overflow-x-hidden overflow-y-auto w-32 lg:w-48 h-full'>
        {states.map((v, i) => {
            return <div key={i} className="f-out f-mc s-0-9 w-full">
                <div key={i} className={`w-full s-0-8 text-lg lg:text-xl p-2 lg:p-3 text-center cursor-pointer font-semibold ${state == v ? 'f-back2' : 'f-backl'}`}
                onClick={e => {
                    setState(v);
                    setSelected('')
                }}
                >
                    {lng(lang, v)}
                </div>
            </div>
        })}
    </div>
}

export default StateSelectionBar;