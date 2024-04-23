import {FC, ReactElement} from 'react';
import { lng } from '~/data/lang';

const UnitProfile:FC<{
    selected:string;
    lang:string;
}> = ({
    selected,
    lang
}) => {
    return selected !== 'l' && <div className='flex-1 fccc gap-5'>
        <div className='bg-cover bg-center w-24 h-24 lg:w-48 lg:h-48' style={{backgroundImage:`url(assets/units/${selected}.png)`}}></div>
        <div className='text-md lg:text-lg text-center text-white font-semibold'>{lng(lang, `${selected}-desc`)}</div>
    </div>
}

export default UnitProfile;