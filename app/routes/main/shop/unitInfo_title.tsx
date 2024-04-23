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

    return <div className="text-lg lg:text-4xl text-white font-bold w-full text-center p-2 lg:p-5 frac">
        {selected != 'l' && <div className='f-out f-mc s-0-5'><div className='cursor-pointer f-back s-0-7 pr-3 pl-3 text-sm lg:text-lg' onClick={e => changeLvl(-1)}>&nbsp;&nbsp;&nbsp;&lt;&nbsp;&nbsp;&nbsp;</div></div>}
        <div>{selected != 'l' && `Lv.${lvl+1}`} {lng(lang, selected)}</div>
        {selected != 'l' && <div className='f-out f-mc s-0-5'><div className='cursor-pointer f-back s-0-7 pr-3 pl-3 text-sm lg:text-lg' onClick={e => changeLvl(1)}>&nbsp;&nbsp;&nbsp;&gt;&nbsp;&nbsp;&nbsp;</div></div>}
    </div>
}

export default Title;