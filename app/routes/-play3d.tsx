import { FC, useEffect, useRef, useState } from "react"
import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
import * as usehooks from "usehooks-ts"
import { lng } from "~/data/lang"
import { getEase } from "~/data/utils";
import { useWebGl } from "~/models/webgl"

const Play:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket, global, isMobile}) => {
    const {width, height} = usehooks.useWindowSize()
    const [once, setOnce] = useState<boolean>(false)
    const [game, setGame] = useState<IGameInitData>()
    const [unitDatas, setUnitDatas] = useState<IUnitData[]>([])
    const [waiting, setWaiting] = useState<number>(0)
    const [health, setHealth] = useState<number>(0)
    const [lastHealth, setLastHealth] = useState<number>(0)
    const [takenDamage, setTakenDamage] = useState<number>(0)
    const [healthAniTimeStart, setHealthAniTimeStart] = useState<number>(0)
    const [healthAniTimeEnd, setHealthAniTimeEnd] = useState<number>(0)
    const [wave, setWave] = useState<number>(0)
    const [coin, setCoin] = useState<number>(0)
    const [selectedPos, setSelectedPos] = useState<[number, number]>([-1, -1])
    const [selectedUnit, setSelectedUnit] = useState<string>('')
    const [text, setText] = useState<string>('')
    const [motionTexts, setMotionTexts] = useState<ITextAnimation[]>([])
    const [textQueue, setTextQueue] = useState<ITextAnimation>()
    const [timeline, setTimeline] = useState<number>(Date.now())
    const [finished, setFinished] = useState<boolean>(false)
    const [finOpacity, setFinOpacity] = useState<number>(0)
    const [showResult, setShowResult] = useState<boolean>(false)
    const [resultPos, setResultPos] = useState<[number, number]>([0, 0])
    const [resultRotation, setResultRotation] = useState<number>(0)
    const [resultScale, setResultScale] = useState<number>(1)
    const [resultText, setResultText] = useState<string>('')
    const [resultGold, setResultGold] = useState<number>(0)
    const [resultExp, setResultExp] = useState<number>(0)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once || !socket || !canvasRef.current) return

        const canvas = canvasRef.current as HTMLCanvasElement

        let _game:IGameInitData;

        const {engine, glOn, glOff, glEmit} = useWebGl(canvas, global)

        socket.emit('ready', user.id)
        socket.on('gameInit', (game:IGameInitData) => {
            setGame(game)
            setHealth(game.maxHealth)
            _game = game
            glOn('ready', () => {
                glEmit('init', game)
                glOff('ready' , () => {})
            })
        })
        socket.on('usersUpdate', (users:IInRoomUser[]) => {
            setCoin(users.find(u => u.socketId === socket.id)?.coin || 0)
        })
        socket.on('coinUpdate', (coin:number) => {
            setCoin(coin)
        })
        socket.on('gameUpdate', (tickData:IGameTickData) => {
            glEmit('gameUpdate', tickData)
            setUnitDatas(unitDatas)
            setHealth(tickData.health)
            setWaiting(tickData.waitingTimer)
        })
        socket.on('roomDeleted', () => {
            set('main')
        })
        socket.on('userSelection', (data:IUserSelectionData[]) => {
            glEmit('userSelection', data)
        })

        socket.on('waveComplete', (wave:number) => {
            setWave(wave)
            if(wave == _game.maxWave) return;
            activeMotion(lng(lang, 'waveComplete'), 1500, [
                {type:'y', startValue:-height/1.5, endValue:0, duration:500, delay:0, ease:'easeOutCubic'},
                {type:'y', startValue:0, endValue:0, duration:500, delay:500, ease:'linear'},
                {type:'y', startValue:0, endValue:height/1.5, duration:500, delay:1000, ease:'easeInCubic'},
            ], {x:0, y:-height, rotation:0, scale:1, opacity:1, anchorX:0.5, anchorY:0.5})
        })
        socket.on('waveStarted', (wave:number) => {
            setWave(wave)
            activeMotion(lng(lang, 'waveStarted'), 1500, [
                {type:'y', startValue:-height/1.5, endValue:0, duration:500, delay:0, ease:'easeOutCubic'},
                {type:'y', startValue:0, endValue:0, duration:500, delay:500, ease:'linear'},
                {type:'y', startValue:0, endValue:height/1.5, duration:500, delay:1000, ease:'easeInCubic'},
            ], {x:0, y:-height, rotation:0, scale:1, opacity:1, anchorX:0.5, anchorY:0.5})
        })
        socket.on('gameOver', (level:number, wave:number) => {
            setFinished(true)
            fetch(`/updateUser/id/${user.id}/level/${level}/wave/${wave}/maxwave/${_game.maxWave}/clear/false`).then(res => res.json()).then((res:{res:IUser, reward:number}) => {
                setShowResult(true)
                setUser(res.res)
                setResultGold(res.reward)
                setResultExp(res.reward)
                setResultText('gameOver')
            }).catch(e => {
                console.log(e)
            })
        })
        socket.on('gameComplete', (level:number) => {
            setFinished(true)
            fetch(`/updateUser/id/${user.id}/level/${level}/wave/${_game.maxWave}/maxwave/${_game.maxWave}/clear/true`).then(res => res.json()).then((res:{res:IUser, reward:number}) => {
                setShowResult(true)
                setUser(res.res)
                setResultGold(res.reward)
                setResultExp(res.reward)
                setResultText('gameComplete')
            }).catch(e => {
                console.log(e)
            })
        })

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            engine.resize()
        }
        resize()

        let timelineloop = setInterval(() => {
            setTimeline(Date.now())
        }, 1000/60)

        const touchStart = (e:TouchEvent) => {
        }
        const touchMove = (e:TouchEvent) => {
        }
        const touchEnd = (e:TouchEvent) => {
        }
        document.addEventListener('touchstart', touchStart)
        document.addEventListener('touchmove', touchMove)
        document.addEventListener('touchend', touchEnd)
        window.addEventListener('resize', resize)
        return () => {
            socket.off('gameInit')
            socket.off('userInit')
            socket.off('gameUpdate')
            socket.off('roomDeleted')
            socket.off('userSelection')
            socket.off('gameOver')
            socket.off('waveComplete')
            socket.off('waveStarted')
            socket.off('gameComplete')
            clearInterval(timelineloop)
            document.removeEventListener('touchstart', touchStart)
            document.removeEventListener('touchmove', touchMove)
            document.removeEventListener('touchend', touchEnd)
            window.removeEventListener('resize', resize)
            engine.dispose()
        }
    }, [once, socket, canvasRef.current])

    useEffect(() => {
        socket.emit('userSelection', {x:selectedPos[0], y:selectedPos[1], type:selectedUnit})
    }, [selectedPos, selectedUnit])

    useEffect(() => {
        if(!finished) return
        let i = 0
        let loop = setInterval(() => {
            setFinOpacity(i/100)
            i++
            if(i > 100) {
                setFinOpacity(1)
                clearInterval(loop)
            }
        }, 5)
    }, [finished])

    useEffect(() => {
        if(!showResult) return
        let i = 0
        let loop = setInterval(() => {
            setResultPos([0, -700 + getEase(i, 'easeOutSine') * 700])
            setResultRotation(20 - getEase(i, 'easeOutSine') * 20)
            setResultScale(1.5 - getEase(i, 'easeOutSine') * 0.5)
            i += 0.01;
            if(i > 1) {
                setResultPos([0, 0])
                setResultRotation(0)
                setResultScale(1)
                clearInterval(loop)
            }
        }, 1000/60)
    }, [showResult])

    useEffect(() => {
        if(!game) return
        if(health != lastHealth){
            setTakenDamage(health - lastHealth)
            setLastHealth(health)
            setHealthAniTimeStart(Date.now())
            setHealthAniTimeEnd(Date.now() + 500)
        }
    }, [health, lastHealth])

    const activeMotion = (value:string, duration:number, motions:IMotion[], defaultOptions:IDefaultOptions, options?:any) => {
        setTextQueue({start:Date.now(), value, duration, motions, defaultOptions, options:options ||
        {fill:0xFFFFFF, fontSize:isMobile ? 48 : 96, fontWeight:900, fontFamily:'Arial', align:'center', dropShadow:true, dropShadowBlur:10, dropShadowAngle:0, dropShadowDistance:0}})
    }
    
    useEffect(() => {
        if(!textQueue) return
        setMotionTexts([...motionTexts, textQueue])
        setTextQueue(undefined)
    }, [textQueue, motionTexts])

    return (<>
        {/* Render Stage */}
        <canvas id="renderCanvas" ref={canvasRef} className="w-full h-full absolute left-0 top-0"></canvas>
        {game ? <>
            {/* Text Motions */}
            {motionTexts.map((animation, index) => {
                let delta = timeline - animation.start
                if(delta > animation.duration){
                    setMotionTexts(motionTexts.filter((_, i) => i != index))
                    return null
                }
                let props:{[key:string]:number} = {
                    x:animation.defaultOptions.x,
                    y:animation.defaultOptions.y,
                    rotation:animation.defaultOptions.rotation,
                    scale:animation.defaultOptions.scale,
                    opacity:animation.defaultOptions.opacity,
                    anchorX: animation.defaultOptions.anchorX,
                    anchorY: animation.defaultOptions.anchorY
                }
                animation.motions.forEach(motion => {
                    if(delta < motion.delay) return;
                    if(delta > motion.delay + motion.duration) return;
                    let progress = (delta - motion.delay) / motion.duration
                    progress = getEase(progress, motion.ease)
                    let value = motion.startValue + (motion.endValue - motion.startValue) * progress
                    props[motion.type] = value;
                })
                return <div key={index} className="absolute pointer-events-none" style={{left:width/2 + props.x, top:height/2 + props.y, transform:`translate(-50%, -50%) rotate(${props.rotation}deg) scale(${props.scale})`, opacity:props.opacity, zIndex:1000,
                color:`#${animation.options.fill.toString(16)}`, fontSize:animation.options.fontSize, fontWeight:animation.options.fontWeight, fontFamily:animation.options.fontFamily, textAlign:animation.options.align, textShadow:animation.options.dropShadow ? `0px 0px ${animation.options.dropShadowBlur}px #000000` : 'none'}}>
                    {animation.value}
                </div>
            })}
            {/* Wave Statement && Coin */}
            <div className="absolute text-white right-0 top-0 flex flex-col font-semibold p-1 lg:p-2 gap-1 lg:gap-2 box text-right">
                <div className="text-sm lg:text-md">{lng(lang, 'wave')} : {wave} / {game.maxWave}</div>
                <div className="text-sm lg:text-md">{lng(lang, 'waitingfornextwave')} : {Math.floor(waiting/1000)}s <button className="noshadow p-1"
                onClick={e => {socket.emit('skipWave')}}>{lng(lang, 'skipwave')}</button></div>
                <div className="text-sm lg:text-md">{lng(lang, 'coin')} : <span className="text-yellow-400">{coin}</span>c</div>
            </div>
            {/* Health Bar */}
            <div className="absolute bottom-2 flex flex-col p-1 box noshadow w-[40%] lg:w-[60%]" style={{left:`50%`, transform:`translate(-50%, -50%)`}}>
                <div className="w-full h-5 bg-[#ffffff22] rounded-md">
                    {[''].map((v) => {
                        const isAnimating = healthAniTimeEnd > timeline;
                        const animationProgress = (timeline - healthAniTimeStart) / (healthAniTimeEnd - healthAniTimeStart);
                        const ease = getEase(animationProgress, 'easeInOutSine');
                        const damage = Math.abs(takenDamage);
                        const backHealth = isAnimating ? (health + (damage * (1 - ease))) / game.maxHealth : health / game.maxHealth;
                        const curHealth = isAnimating ? (health + (damage * ease)) / (health + damage) : 1;
                        return <div key={v} className="h-full bg-[#ffffff99] rounded-md" style={{width:`${backHealth * 100}%`}}>
                            <div className="h-full bg-[#ffffffaa] rounded-md text-black text-center align-middle font-semibold text-sm lg:text-md" style={{width:`${curHealth * 100}%`}}>{health} / {game.maxHealth}</div>
                        </div>
                    })}
                </div>
            </div>
            {/* Unit Selection */}
            {selectedPos[0] != -1 && !selectedUnit && !unitDatas.find(v => v.x == selectedPos[0] && v.y == selectedPos[1]) &&
            <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-1 lg:p-2 gap-1 lg:gap-2 box w-38">
                {user.equipped.map((unit:string, index:number) => {
                    if(unit == 'l') return null;
                    let myUnit = global.units.find(v => v.type == unit) || {cost:0}
                    const canBuy = coin - myUnit.cost >= 0
                    return <button key={index} className={`noshadow p-1 flex flex-col items-center justify-between ${!canBuy ? "text-red-700" : "text-white"}`}
                    onClick={e => {
                        setSelectedUnit(unit)
                    }}>
                        <div className="flex flex-row items-center justify-between gap-3">
                            <img src={`assets/units/${unit}.png`} className="w-6 h-6 lg:w-8 lg:h-8 rounded-md" />
                            <div className="text-sm lg:text-md">{lng(lang, unit)}</div>
                        </div>
                        <div className="text-sm lg:text-md">{myUnit.cost}c</div>
                    </button>
                })}
                <button className="noshadow p-1 text-sm lg:text-md" onClick={e=> setSelectedPos([-1, -1])}>{lng(lang, 'cancel')}</button>
            </div>}
            {/* Unit Placement */}
            {selectedPos[0] != -1 && selectedUnit && !unitDatas.find(v => v.x == selectedPos[0] && v.y == selectedPos[1]) && [''].map((_v, i) => {
                const cost = (global.units.find(v => v.type == selectedUnit)?.cost as number)
                const canPlace = coin >= cost
                return <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-1 lg:p-2 gap-1 lg:gap-2 box w-38">
                    <div className="flex flex-row items-center justify-between gap-2 lg:gap-3">
                        <img src={`assets/units/${selectedUnit}.png`} className="w-6 h-6 lg:w-8 lg:h-8 rounded-md" />
                        <div className="text-sm lg:text-md">{lng(lang, selectedUnit)}</div>
                    </div>
                    <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'damage')} {global.units.find(v => v.type == selectedUnit)?.damage[0]}</div>
                    <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'rate')} {(global.units.find(v => v.type == selectedUnit)?.rate as number[])[0]/1000}s</div>
                    <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'range')} {global.units.find(v => v.type == selectedUnit)?.range[0]}m</div>
                    <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'bulletSpeed')} {global.units.find(v => v.type == selectedUnit)?.bulletSpeed[0]}</div>
                    <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'cost')} {global.units.find(v => v.type == selectedUnit)?.cost}c</div>
                    <button className="noshadow p-1 text-sm lg:text-md text-white" onClick={e => {
                        setSelectedUnit('')
                    }}>{lng(lang, 'cancel')}</button>
                    <button disabled={!canPlace} className={`noshadow p-1 text-sm lg:text-md ${canPlace ? 'text-white' : 'text-red-700'}`}
                    onClick={e => {
                        socket.emit('placeUnit', {x:selectedPos[0], y:selectedPos[1], type:selectedUnit})
                        setSelectedUnit('')
                    }}>{lng(lang, 'place')} - {cost}c</button>
                </div>
            })}
            {/* Unit attributes & Upgrade */}
            {selectedPos[0] != -1 && !selectedUnit && unitDatas.find(v => v.x == selectedPos[0] && v.y == selectedPos[1]) && [''].map((_v, i) => {
                const selected = unitDatas.find(v => v.x == selectedPos[0] && v.y == selectedPos[1])
                if(!selected) return null;
                const thisUnit = global.units.find(v => v.type == selected.type)
                if(!thisUnit) return null;
                const isMaxLvl = thisUnit.upgradeCost.length < selected.lvl;
                const upgCost = thisUnit.upgradeCost[selected.lvl-1];
                const canUpgrade = coin >= upgCost;
                const allUpgCosts = selected.lvl == 1 ? 0 : selected.lvl == 2 ? thisUnit.upgradeCost[0] : thisUnit.upgradeCost.slice(0, selected.lvl-1).reduce((a, b) => a + b)
                const sellCost = Math.round((thisUnit.cost + allUpgCosts)/2);
                return <>
                    <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-1 gap-1 lg:p-2 lg:gap-2 box w-38">
                        <div className="flex flex-row items-center justify-between gap-2 lg:gap-3">
                            <img src={`assets/units/${selected.type}.png`} className="w-6 h-6 lg:w-8 lg:h-8 rounded-md" />
                            <div className="text-sm lg:text-md">Lv.{selected.lvl}</div>
                            <div className="text-sm lg:text-md">{lng(lang, selected.type)}</div>
                        </div>
                        <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'damage')} {thisUnit.damage[selected.lvl-1]}
                        {!isMaxLvl && ` -> ${thisUnit.damage[selected.lvl]}`}</div>
                        <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'rate')} {(thisUnit.rate as number[])[selected.lvl-1]/1000}s
                        {!isMaxLvl && ` -> ${(thisUnit.rate as number[])[selected.lvl]/1000}s`}</div>
                        <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'range')} {thisUnit.range[selected.lvl-1]}m
                        {!isMaxLvl && ` -> ${thisUnit.range[selected.lvl]}m`}</div>
                        <div className="text-sm lg:text-md p-1 lg:p-2">{lng(lang, 'bulletSpeed')} {thisUnit.bulletSpeed[selected.lvl-1]}
                        {!isMaxLvl && ` -> ${thisUnit.bulletSpeed[selected.lvl]}`}</div>
                        <button className="noshadow p-1 text-sm lg:text-md" onClick={e => {
                            socket.emit('sellUnit', {x:selected.x, y:selected.y})
                        }}>{lng(lang, "sell")} - {sellCost}c</button>
                        {!isMaxLvl && <button disabled={!canUpgrade} className={`noshadow p-1 text-sm lg:text-md ${!canUpgrade && "text-red-700"}`}
                        onClick={e => {
                            socket.emit('upgradeUnit', {x:selected.x, y:selected.y})
                        }}>{lng(lang, "upgrade")} - {upgCost}c</button>}
                    </div>
                </>
            })}
            {/* Admin */}
            {user.admin && <div className="absolute text-white right-0 bottom-0 flex flex-col font-semibold p-1 lg:p-2 gap-1 lg:gap-2 box">
                <input className="noshadow p-1 text-sm lg:text-md" type="text" value={text} onChange={e => setText(e.target.value)} />
                <button className="noshadow p-1 text-sm lg:text-md text-white" onClick={e => {
                    socket.emit('gameCommand', text)
                    setText('')
                }}>Submit</button>
            </div>}
            {/* Finished */}
            {finished && <div className="absolute top-0 left-0 w-full h-full bg-[#000000aa] flex flex-col items-center justify-center" style={{opacity: finOpacity}}>
                {showResult ? <div className="box w-[60%] h-[60%] flex flex-col items-center justify-center gap-2 lg:gap-3"
                style={{transform: `translate(${resultPos[0]}px, ${resultPos[1]}px) rotate(${resultRotation}deg) scale(${resultScale})`}}>
                    <div className="text-white text-2xl lg:text-4xl font-bold w-full text-center mb-5">{lng(lang, resultText)}</div>
                    <div className="text-white text-xl lg:text-2xl font-bold w-full text-center">{lng(lang, 'coin')} : {resultGold}c</div>
                    <div className="text-white text-xl lg:text-2xl font-bold w-full text-center">{lng(lang, 'exp')} : {resultExp}xp</div>
                    <button className="noshadow p-1.5 pr-3 pl-3 lg:p-3 lg:pr-6 lg:pl-6 text-white text-md lg:text-lg" onClick={e => {
                        set('main')
                    }}>{lng(lang, 'close')}</button>
                </div> : <></>}
            </div>}
        </>:
        <div className="cover">
            <div className="absolute bottom-0 right-0 text-white text-lg lg:text-xl font-bold">{lng(lang, 'waiting for players')}...</div>
        </div>
        }
    </>)
}

export default Play