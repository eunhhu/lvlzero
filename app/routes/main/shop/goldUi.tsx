import { FC } from "react"

const GoldUi:FC<{
    gold:number
}> = ({
    gold
}) => {
    return <div className="f-backl s-0-9 font-bold absolute right-0 top-0 p-1.5 lg:p-2 w-40 text-right text-white">{gold}G</div>
}

export default GoldUi;