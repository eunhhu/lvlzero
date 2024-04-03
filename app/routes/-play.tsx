import { Stage, Container, Sprite, Graphics, useApp, Text } from "@pixi/react"
import { FC, useEffect, useRef, useState } from "react"
import * as usehooks from "usehooks-ts"
import * as PIXI from 'pixi.js';
import { lng } from "~/data/lang"
import { units as AllUnits } from "~/data/db";
import { getEase } from "~/data/utils";

const Tilemap: FC<{
    tileset: string;
    notileset: string;
    tilemapData: [number, number][];
    tileSize: number;
    size: number;
  }> = ({ tileset, notileset, tilemapData, tileSize, size }) => {

    const noPathData = Array.from({length: size}, (_, i) => Array.from({length: size}, (_, j) => [j, i]))

    return (
      <>
        {noPathData.map((row, i) => {
          return row.map((tile, j) => {
            return (
              <Sprite
                key={`${i}-${j}`}
                x={j * tileSize - size * tileSize / 2 + tileSize / 2}
                y={i * tileSize - size * tileSize / 2 + tileSize / 2}
                texture={tilemapData.find(v => v[0] == j && v[1] == i) ? PIXI.Texture.from(tileset) : PIXI.Texture.from(notileset)}
                width={tileSize}
                height={tileSize}
                anchor={0.5}
              />
            );
          });
        })}
      </>
    );
};

const Play:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket}) => {
    const {width, height} = usehooks.useWindowSize()
    const [once, setOnce] = useState<boolean>(false)
    const [game, setGame] = useState<IGameInitData>()
    const [viewport, setViewport] = useState<[number, number]>([0, 0])
    const [zoom, setZoom] = useState<number>(1)
    const [tileSize, setTileSize] = useState<number>(Math.min(width, height) / (game || {size:1}).size * zoom)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [units, setUnits] = useState<IUnitData[]>([])
    const [enemies, setEnemies] = useState<IEnemyData[]>([])
    const [projectiles, setProjectiles] = useState<IProjectileData[]>([])
    const [waiting, setWaiting] = useState<number>(0)
    const [health, setHealth] = useState<number>(0)
    const [wave, setWave] = useState<number>(0)
    const [coin, setCoin] = useState<number>(0)
    const [selectedPos, setSelectedPos] = useState<[number, number]>([-1, -1])
    const [selectedUnit, setSelectedUnit] = useState<string>('')
    const [selectors, setSelectors] = useState<IUserSelectionData[]>([])
    const [text, setText] = useState<string>('')
    const [motionSprites, setMotionSprites] = useState<ISpriteAnimation[]>([])
    const [motionTexts, setMotionTexts] = useState<ITextAnimation[]>([])
    const [spriteQueue, setSpriteQueue] = useState<ISpriteAnimation>()
    const [textQueue, setTextQueue] = useState<ITextAnimation>()
    const [timeline, setTimeline] = useState<number>(Date.now())
    const [dragging, setDragging] = useState<boolean>(false)
    const [draggingStart, setDraggingStart] = useState<[number, number]>([0, 0])
    const [curDrag, setCurDrag] = useState<[number, number]>([0, 0])
    const [lastViewport, setLastViewport] = useState<[number, number]>([0, 0])

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        if(!socket) return
        let _game:IGameInitData;
        socket.emit('ready', user.id)
        socket.on('gameInit', (game:IGameInitData) => {
            setGame(game)
            _game = game
        })
        socket.on('usersUpdate', (users:IInRoomUser[]) => {
            setCoin(users.find(u => u.socketId === socket.id)?.coin || 0)
        })
        socket.on('coinUpdate', (coin:number) => {
            setCoin(coin)
        })
        socket.on('gameUpdate', (tickData:IGameTickData) => {
            setUnits(tickData.units)
            setEnemies(tickData.enemies)
            setProjectiles(tickData.projectiles)
            setHealth(tickData.health)
            setWaiting(tickData.waitingTimer)
        })
        socket.on('roomDeleted', () => {
            set('main')
        })
        socket.on('userSelection', (data:IUserSelectionData[]) => {
            setSelectors(data.filter(d => d.x != selectedPos[0] && d.y != selectedPos[1]))
        })
        
        socket.on('waveComplete', (wave:number) => {
            setWave(wave)
            activeMotion('text', lng(lang, 'waveComplete'), 1500, [
                {type:'y', startValue:-height/1.5, endValue:0, duration:500, delay:0, ease:'easeOutCubic'},
                {type:'y', startValue:0, endValue:0, duration:500, delay:500, ease:'linear'},
                {type:'y', startValue:0, endValue:height/1.5, duration:500, delay:1000, ease:'easeInCubic'},
            ], {x:0, y:-height, rotation:0, scale:1, opacity:1, anchorX:0.5, anchorY:0.5})
        })
        socket.on('waveStarted', (wave:number) => {
            setWave(wave)
            activeMotion('text', lng(lang, 'waveStarted'), 1500, [
                {type:'y', startValue:-height/1.5, endValue:0, duration:500, delay:0, ease:'easeOutCubic'},
                {type:'y', startValue:0, endValue:0, duration:500, delay:500, ease:'linear'},
                {type:'y', startValue:0, endValue:height/1.5, duration:500, delay:1000, ease:'easeInCubic'},
            ], {x:0, y:-height, rotation:0, scale:1, opacity:1, anchorX:0.5, anchorY:0.5})
        })
        socket.on('gameOver', (level:number, wave:number) => {
            fetch(`/updateUser/id/${user.id}/level/${level}/wave/${wave}/maxwave/${_game.maxWave}/clear/false`).then(res => res.json()).then((res:{res:IUser}) => {
                setUser(res.res)
                set('main')
            }).catch(e => {
                console.log(e)
            })
        })
        socket.on('gameComplete', (level:number) => {
            // need to add motion
            fetch(`/updateUser/id/${user.id}/level/${level}/wave/${_game.maxWave}/maxwave/${_game.maxWave}/clear/true`).then(res => res.json()).then((res:{res:IUser}) => {
                setUser(res.res)
                set('main')
            }).catch(e => {
                console.log(e)
            })
        })

        let timelineloop = setInterval(() => {
            setTimeline(Date.now())
        }, 1000/60)
        
        const dragStart = (e:MouseEvent) => {
            setDragging(true)
            setDraggingStart([e.clientX, e.clientY])
        }
        const drag = (e:MouseEvent) => {
            setCurDrag([e.clientX, e.clientY])
        }
        const drop = (e:MouseEvent) => {
            setDragging(false)
        }
        document.addEventListener('mousedown', dragStart)
        document.addEventListener('mousemove', drag)
        document.addEventListener('mouseup', drop)
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
            document.removeEventListener('mousedown', dragStart)
            document.removeEventListener('mousemove', drag)
            document.removeEventListener('mouseup', drop)
        }
    }, [once, socket])

    useEffect(() => {
        const md = (e:MouseEvent) => {
            setLastViewport([viewport[0], viewport[1]])
        }
        document.addEventListener('mousedown', md)
        return () => {
            document.removeEventListener('mousedown', md)
        }
    }, [viewport])

    useEffect(() => {
        const wheel = (e:WheelEvent) => {
            setZoom(zoom + e.deltaY/1000)
        }
        document.addEventListener('wheel', wheel)
        return () => {
            document.removeEventListener('wheel', wheel)
        }
    }, [zoom])

    useEffect(() => {
        if(!dragging) return
        setViewport([lastViewport[0] + (draggingStart[0] - curDrag[0]), lastViewport[1] + (draggingStart[1] - curDrag[1])])
    }, [dragging, draggingStart, curDrag, lastViewport])

    const activeMotion = (type:"sprite"|"text", value:string, duration:number, motions:IMotion[], defaultOptions:IDefaultOptions, options?:PIXI.TextStyle) => {
        if(type == "sprite"){
            setSpriteQueue({start:Date.now(), value, duration, motions, defaultOptions})
        } else {
            setTextQueue({start:Date.now(), value, duration, motions, defaultOptions, options:options ||
                {fill:0xFFFFFF, fontSize:96, fontFamily:'Arial', align:'center', dropShadow:true, dropShadowBlur:10, dropShadowAngle:0, dropShadowDistance:0}})
        }
    }

    useEffect(() => {
        if(!spriteQueue) return
        setMotionSprites([...motionSprites, spriteQueue])
        setSpriteQueue(undefined)
    }, [spriteQueue, motionSprites])

    useEffect(() => {
        if(!textQueue) return
        setMotionTexts([...motionTexts, textQueue])
        setTextQueue(undefined)
    }, [textQueue, motionTexts])

    useEffect(() => {
        if(!game) return
        const click = (e:MouseEvent) => {
            if((e.target as HTMLElement).nodeName == "CANVAS" && viewport[0] == lastViewport[0] && viewport[1] == lastViewport[1]){
                let x = Math.floor((e.clientX - width/2) / tileSize + game.size/2 + viewport[0] / tileSize)
                let y = Math.floor((e.clientY - height/2) / tileSize + game.size/2 + viewport[1] / tileSize)
                if(x < 0 || x >= game.size || y < 0 || y >= game.size) return setSelectedPos([-1, -1]);
                if(selectors.find(s => s.x == x && s.y == y)) return;
                if(game.path.find(p => p[0] == x && p[1] == y)) return;
                setSelectedPos([x, y])
                setSelectedUnit('')
            }
        }
        document.addEventListener('click', click)
        return () => {
            document.removeEventListener('click', click)
        }
    }, [game, width, height, tileSize, selectors, viewport, lastViewport])

    useEffect(() => {
        socket.emit('userSelect', {x:selectedPos[0], y:selectedPos[1], type:selectedUnit})
    }, [selectedPos, selectedUnit])

    useEffect(() => {
        if(!game) return
        setTileSize(Math.min(width, height) / game.size * zoom)
    }, [game, width, height, zoom])

    return (<>
        {game ? <><Stage width={width} height={height}>
            <Container pivot={[-width/2 + viewport[0], -height/2 + viewport[1]]}>
                <Tilemap
                    tileset="assets/tiles/grass.png"
                    notileset="assets/tiles/dirt.png"
                    tilemapData={game.path}
                    tileSize={tileSize}
                    size={game.size}
                />
                {units.map((unit, index) => {
                    return (
                        <Sprite
                            key={index}
                            x={unit.x * tileSize - game.size * tileSize/2 + tileSize/2}
                            y={unit.y * tileSize - game.size * tileSize/2 + tileSize/2}
                            angle={unit.angle / Math.PI * 180}
                            texture={PIXI.Texture.from(`assets/units/${unit.type}.png`)}
                            width={tileSize}
                            height={tileSize}
                            anchor={0.5}
                        />
                    );
                })}
                {enemies.map((enemy, index) => {
                    return <>
                        <Sprite
                            key={index}
                            x={enemy.x * tileSize - game.size * tileSize/2 + tileSize/2}
                            y={enemy.y * tileSize - game.size * tileSize/2 + tileSize/2}
                            texture={PIXI.Texture.from(`assets/enemies/${enemy.type}.webp`)}
                            width={tileSize}
                            height={tileSize}
                            tint={enemy.status.includes('slow') ? 0x0000FF : 0xFFFFFF}
                            anchor={0.5}
                        />
                        <Graphics draw={g => {
                            g.clear();
                            g.lineStyle(2, 0x000000, 1);
                            g.beginFill(0xFF0000);
                            g.drawRect(enemy.x * tileSize - game.size * tileSize/2 + tileSize/2 - tileSize/2, enemy.y * tileSize - game.size * tileSize/2, tileSize, 5);
                            g.endFill();
                            g.beginFill(0x00FF00);
                            g.drawRect(enemy.x * tileSize - game.size * tileSize/2 + tileSize/2 - tileSize/2, enemy.y * tileSize - game.size * tileSize/2, tileSize * (enemy.health / enemy.maxHealth), 5);
                            g.endFill();
                        }} />
                    </>
                })}
                {projectiles.map((projectile, index) => {
                    return (
                        <Sprite
                            key={index}
                            x={projectile.x * tileSize - game.size * tileSize/2 + tileSize/2}
                            y={projectile.y * tileSize - game.size * tileSize/2 + tileSize/2}
                            angle={projectile.angle}
                            texture={PIXI.Texture.from(`assets/projectiles/basic.png`)}
                            width={tileSize}
                            height={tileSize}
                            anchor={0.5}
                        />
                    );
                })}
                {motionSprites.map((animation, index) => {
                    let delta = timeline - animation.start
                    if(delta > animation.duration){
                        setMotionSprites(motionSprites.filter((_, i) => i != index))
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
                    return <Sprite key={index} texture={PIXI.Texture.from(animation.value)}
                    x={props.x} y={props.y} rotation={props.rotation}
                    scale={props.scale} alpha={props.opacity} anchor={[props.anchorX, props.anchorY]} />
                })}
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
                    return <Text key={index} text={animation.value} x={props.x} y={props.y} rotation={props.rotation}
                    scale={props.scale} alpha={props.opacity} anchor={[props.anchorX, props.anchorY]} style={animation.options} />
                })}
            </Container>
        </Stage>
        {selectors.map((v, i) => {
            return <div key={i} className="absolute border-2 border-white" style={{width:tileSize, height:tileSize,
            left:v.x * tileSize + width/2 - (game.size * tileSize)/2 - viewport[0],
            top:v.y * tileSize + height/2 - (game.size * tileSize)/2 - viewport[1],
            backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundImage: v.type ? `url("assets/units/${v.type}.png")` : '', opacity:'0.5'}}></div>
        })}
        {selectedPos[0] != -1 && <div className="absolute border-2 border-yellow-300" style={{width:tileSize, height:tileSize,
            left:selectedPos[0] * tileSize + width/2 - (game.size * tileSize)/2 - viewport[0],
            top:selectedPos[1] * tileSize + height/2 - (game.size * tileSize)/2 - viewport[1],
            backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundImage: selectedUnit ? `url("assets/units/${selectedUnit}.png")` : '', opacity:'0.5'}}
            onClick={e => {
                setSelectedPos([-1, -1])
                setSelectedUnit('')
        }}></div>}
        <div className="absolute text-white right-0 top-0 flex flex-col font-semibold p-2 gap-2 box text-right">
            <div>{lng(lang, 'wave')} : {wave} / {game.maxWave}</div>
            <div>{lng(lang, 'waitingfornextwave')} : {Math.floor(waiting/1000)}s <button className="noshadow p-1"
            onClick={e => {socket.emit('skipWave')}}>{lng(lang, 'skipwave')}</button></div>
            <div>{lng(lang, 'health')} : {health}</div>
            <div>{lng(lang, 'coin')} : {coin}c</div>
        </div>
        {selectedPos[0] != -1 && !selectedUnit && !units.find(v => v.x == selectedPos[0] && v.y == selectedPos[1]) &&
        <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-2 gap-2 box w-38">
            {user.equipped.map((unit:string, index:number) => {
                if(unit == 'l') return null;
                let myUnit = AllUnits.find(v => v.type == unit) || {cost:0}
                const canBuy = coin - myUnit.cost >= 0
                return <button key={index} className={`noshadow p-1 flex flex-col items-center justify-between ${!canBuy ? "text-red-700" : "text-white"}`}
                onClick={e => {
                    setSelectedUnit(unit)
                }}>
                    <div className="flex flex-row items-center justify-between gap-3">
                        <img src={`assets/units/${unit}.png`} className="w-8 h-8 rounded-md" />
                        <div>{lng(lang, unit)}</div>
                    </div>
                    <div>{myUnit.cost}c</div>
                </button>
            })}
        </div>}
        {selectedPos[0] != -1 && selectedUnit && !units.find(v => v.x == selectedPos[0] && v.y == selectedPos[1]) && [''].map((_v, i) => {
            const canPlace = coin >= (AllUnits.find(v => v.type == selectedUnit)?.cost as number)
            return <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-2 gap-2 box w-38">
                <div className="flex flex-row items-center justify-between gap-3">
                    <img src={`assets/units/${selectedUnit}.png`} className="w-8 h-8 rounded-md" />
                    <div>{lng(lang, selectedUnit)}</div>
                </div>
                <div className="p-2">{lng(lang, 'damage')} {AllUnits.find(v => v.type == selectedUnit)?.damage[0]}</div>
                <div className="p-2">{lng(lang, 'rate')} {(AllUnits.find(v => v.type == selectedUnit)?.rate as number[])[0]/1000}s</div>
                <div className="p-2">{lng(lang, 'range')} {AllUnits.find(v => v.type == selectedUnit)?.range[0]}m</div>
                <div className="p-2">{lng(lang, 'bulletSpeed')} {AllUnits.find(v => v.type == selectedUnit)?.bulletSpeed[0]}</div>
                <div className="p-2">{lng(lang, 'cost')} {AllUnits.find(v => v.type == selectedUnit)?.cost}c</div>
                <button className="noshadow p-1 text-white" onClick={e => {
                    setSelectedUnit('')
                }}>{lng(lang, 'cancel')}</button>
                <button disabled={!canPlace} className={`noshadow p-1 ${canPlace ? 'text-white' : 'text-red-700'}`}
                onClick={e => {
                    socket.emit('placeUnit', {x:selectedPos[0], y:selectedPos[1], type:selectedUnit})
                    setSelectedUnit('')
                }}>{lng(lang, 'place')}</button>
            </div>
        })}
        {selectedPos[0] != -1 && !selectedUnit && units.find(v => v.x == selectedPos[0] && v.y == selectedPos[1]) && [''].map((_v, i) => {
            const selected = units.find(v => v.x == selectedPos[0] && v.y == selectedPos[1])
            if(!selected) return null;
            const thisUnit = AllUnits.find(v => v.type == selected.type)
            if(!thisUnit) return null;
            const isMaxLvl = thisUnit.upgradeCost.length < selected.lvl;
            const upgCost = thisUnit.upgradeCost[selected.lvl-1];
            const canUpgrade = coin >= upgCost;
            const allUpgCosts = selected.lvl == 1 ? 0 : selected.lvl == 2 ? thisUnit.upgradeCost[0] : thisUnit.upgradeCost.slice(0, selected.lvl-1).reduce((a, b) => a + b)
            const sellCost = Math.round((thisUnit.cost + allUpgCosts)/2);
            return <>
                <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-2 gap-2 box w-38">
                    <div className="flex flex-row items-center justify-between gap-3">
                        <img src={`assets/units/${selected.type}.png`} className="w-8 h-8 rounded-md" />
                        <div>Lv.{selected.lvl}</div>
                        <div>{lng(lang, selected.type)}</div>
                    </div>
                    <div className="p-2">{lng(lang, 'damage')} {thisUnit.damage[selected.lvl-1]}
                    {!isMaxLvl && ` -> ${thisUnit.damage[selected.lvl]}`}</div>
                    <div className="p-2">{lng(lang, 'rate')} {(thisUnit.rate as number[])[selected.lvl-1]/1000}s
                    {!isMaxLvl && ` -> ${(thisUnit.rate as number[])[selected.lvl]/1000}s`}</div>
                    <div className="p-2">{lng(lang, 'range')} {thisUnit.range[selected.lvl-1]}m
                    {!isMaxLvl && ` -> ${thisUnit.range[selected.lvl]}m`}</div>
                    <div className="p-2">{lng(lang, 'bulletSpeed')} {thisUnit.bulletSpeed[selected.lvl-1]}
                    {!isMaxLvl && ` -> ${thisUnit.bulletSpeed[selected.lvl]}`}</div>
                    <button className="noshadow p-1" onClick={e => {
                        socket.emit('sellUnit', {x:selected.x, y:selected.y})
                    }}>{lng(lang, "sell")} - {sellCost}c</button>
                    {!isMaxLvl && <button disabled={!canUpgrade} className={`noshadow p-1 ${!canUpgrade && "text-red-700"}`}
                    onClick={e => {
                        socket.emit('upgradeUnit', {x:selected.x, y:selected.y})
                    }}>{lng(lang, "upgrade")} - {upgCost}c</button>}
                </div>
            </>
        })}
        {user.admin && <div className="absolute text-white right-0 bottom-0 flex flex-col font-semibold p-2 gap-2 box">
            <input className="noshadow p-1" type="text" value={text} onChange={e => setText(e.target.value)} />
            <button className="noshadow p-1 text-white" onClick={e => {
                socket.emit('gameCommand', text)
                setText('')
            }}>Admin</button>
        </div>}
        </>:
        <div className="cover" style={{backgroundImage: `url(assets/tiles/grass.png)`}}>
            <div className="absolute bottom-0 right-0 text-white text-2xl font-bold">{lng(lang, 'waiting for players')}...</div>
        </div>
        }
    </>)
}

export default Play