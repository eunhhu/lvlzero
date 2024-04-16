import { FC } from "react"

const GoldUi:FC<{
    gold:number
}> = ({
    gold
}) => {
    return <div className="absolute right-0 top-0 box p-1.5 lg:p-2 w-40 text-right">{gold}G</div>
}

export default GoldUi;