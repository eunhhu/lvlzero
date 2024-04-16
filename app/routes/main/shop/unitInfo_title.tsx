import {FC, Dispatch, SetStateAction} from 'react'
import { lng } from '~/data/lang';

const Title:FC<{
    lang:string;
    selected:string;
    lvl:number;
    setLvl:Dispatch<SetStateAction<number>>;
    global:IDB;
}> = ({
    lang,
    selected,
    lvl,
    setLvl,
    global
}) => {

    const changeLvl = (n:number) => {
        if(n < 0 && lvl < 1) return;
        const unit = global.units.find(v => v.type == selected);
        if(!unit) return;
        if(n > 0 && lvl >= unit.upgradeCost.length) return;
        setLvl(lvl + n)
    }

    return <div className="text-lg lg:text-4xl text-white font-bold w-full text-center p-2 lg:p-5 flex flex-row items-center justify-around">
        {selected != 'l' && <button className='pt-0 pb-0 pr-3 pl-3 text-sm lg:text-lg' onClick={e => changeLvl(-1)}>&lt;</button>}
        <div>{selected != 'l' && `Lv.${lvl+1}`} {lng(lang, selected)}</div>
        {selected != 'l' && <button className='pt-0 pb-0 pr-3 pl-3 text-sm lg:text-lg' onClick={e => changeLvl(1)}>&gt;</button>}
    </div>
}

export default Title;