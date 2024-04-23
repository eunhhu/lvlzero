import { Dispatch, FC, SetStateAction, useState } from "react"
import { lng } from "~/data/lang"

const GraphicSettings:FC<{lang:string, setLang:Dispatch<SetStateAction<string>>}> = ({lang, setLang}) => {
    const [damageText, setDamageText] = useState<boolean>(localStorage.getItem('damageText') == '1' ? true : false)
    const [graphicFilter, setGraphicFilter] = useState<boolean>(localStorage.getItem('graphicFilter') == '1' ? true : false)
    const [hitEffect, setHitEffect] = useState<boolean>(localStorage.getItem('hitEffect') == '1' ? true : false)
    return <div className='flex-1 fcsc w-full overflow-x-hidden overflow-y-auto p-1.5 lg:p-3 gap-1 lg:gap-2'>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="text-white font-bold text-lg lg:text-xl">{lng(lang, "damage text")}</div>
            <div className="w-8 h-8 rounded-full bg-[#0009] fccc cursor-pointer" onClick={e => {
                setDamageText(!damageText)
                localStorage.setItem('damageText', damageText ? '0' : '1')
            }}>{damageText && <div className="w-4 h-4 rounded-full bg-white"></div>}</div>
        </div>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="text-white font-bold text-lg lg:text-xl">{lng(lang, "graphic filter")}</div>
            <div className="w-8 h-8 rounded-full bg-[#0009] fccc cursor-pointer" onClick={e => {
                setGraphicFilter(!graphicFilter)
                localStorage.setItem('graphicFilter', graphicFilter ? '0' : '1')
            }}>{graphicFilter && <div className="w-4 h-4 rounded-full bg-white"></div>}</div>
        </div>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="text-white font-bold text-lg lg:text-xl">{lng(lang, "hit effect")}</div>
            <div className="w-8 h-8 rounded-full bg-[#0009] fccc cursor-pointer" onClick={e => {
                setHitEffect(!hitEffect)
                localStorage.setItem('hitEffect', hitEffect ? '0' : '1')
            }}>{hitEffect && <div className="w-4 h-4 rounded-full bg-white"></div>}</div>
        </div>
    </div>
}

export default GraphicSettings