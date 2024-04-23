import { Dispatch, FC, SetStateAction } from "react"
import { lng } from "~/data/lang"

const GeneralSettings:FC<{lang:string, setLang:Dispatch<SetStateAction<string>>}> = ({lang, setLang}) => {
    return <div className='flex-1 fcsc w-full overflow-x-hidden overflow-y-auto p-1.5 lg:p-3 gap-1 lg:gap-2'>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="text-white font-bold text-lg lg:text-xl">{lng(lang, "language")}</div>
            <select value={lang} onChange={e => {
                localStorage.setItem('lang', e.target.value)
                setLang(e.target.value)
            }} className="f-sel f-mc s-0-7" name="" id="">
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="jp">日本語</option>
                <option value="cn">中文</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ru">Русский</option>
                <option value="pt">Português</option>
                <option value="it">Italiano</option>
            </select>
        </div>
    </div>
}

export default GeneralSettings