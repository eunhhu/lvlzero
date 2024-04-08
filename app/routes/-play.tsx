import { Stage, Container, Sprite, Graphics, useApp, Text } from "@pixi/react"
import { FC, useEffect, useRef, useState } from "react"
import * as usehooks from "usehooks-ts"
import * as PIXI from 'pixi.js';
import { lng } from "~/data/lang"
import { getEase, gradient } from "~/data/utils";

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

const Play:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket, global, isMobile}) => {
    const {width, height} = usehooks.useWindowSize()
    const [once, setOnce] = useState<boolean>(false)
    const [game, setGame] = useState<IGameInitData>()
    const [viewport, setViewport] = useState<[number, number]>([0, 0])
    const [zoom, setZoom] = useState<number>(1)
    const [tileSize, setTileSize] = useState<number>(Math.min(width, height) / (game || {size:1}).size * zoom)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [unitDatas, setUnitDatas] = useState<IUnitData[]>([])
    const [enemyDatas, setEnemyDatas] = useState<IEnemyData[]>([])
    const [projectileDatas, setProjectileDatas] = useState<IProjectileData[]>([])
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
    const [selectors, setSelectors] = useState<IUserSelectionData[]>([])
    const [text, setText] = useState<string>('')
    const [motionSprites, setMotionSprites] = useState<ISpriteAnimation[]>([])
    const [motionTexts, setMotionTexts] = useState<ITextAnimation[]>([])
    const [motionGlobalTexts, setMotionGlobalTexts] = useState<ITextAnimation[]>([])
    const [spriteQueue, setSpriteQueue] = useState<ISpriteAnimation>()
    const [textQueue, setTextQueue] = useState<ITextAnimation>()
    const [globalTextQueue, setGlobalTextQueue] = useState<ITextAnimation>()
    const [timeline, setTimeline] = useState<number>(Date.now())
    const [dragging, setDragging] = useState<boolean>(false)
    const [draggingStart, setDraggingStart] = useState<[number, number]>([0, 0])
    const [curDrag, setCurDrag] = useState<[number, number]>([0, 0])
    const [lastViewport, setLastViewport] = useState<[number, number]>([0, 0])
    const [finished, setFinished] = useState<boolean>(false)
    const [finOpacity, setFinOpacity] = useState<number>(0)
    const [showResult, setShowResult] = useState<boolean>(false)
    const [resultPos, setResultPos] = useState<[number, number]>([0, 0])
    const [resultRotation, setResultRotation] = useState<number>(0)
    const [resultScale, setResultScale] = useState<number>(1)
    const [resultText, setResultText] = useState<string>('')
    const [resultGold, setResultGold] = useState<number>(0)
    const [resultExp, setResultExp] = useState<number>(0)

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
            setHealth(game.maxHealth)
            _game = game
        })
        socket.on('usersUpdate', (users:IInRoomUser[]) => {
            setCoin(users.find(u => u.socketId === socket.id)?.coin || 0)
        })
        socket.on('coinUpdate', (coin:number) => {
            setCoin(coin)
        })
        socket.on('gameUpdate', (tickData:IGameTickData) => {
            setUnitDatas(tickData.units)
            setEnemyDatas(tickData.enemies)
            setProjectileDatas(tickData.projectiles)
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
            if(wave == _game.maxWave) return;
            activeMotion('globalText', lng(lang, 'waveComplete'), 1500, [
                {type:'y', startValue:-height/1.5, endValue:0, duration:500, delay:0, ease:'easeOutCubic'},
                {type:'y', startValue:0, endValue:0, duration:500, delay:500, ease:'linear'},
                {type:'y', startValue:0, endValue:height/1.5, duration:500, delay:1000, ease:'easeInCubic'},
            ], {x:0, y:-height, rotation:0, scale:1, opacity:1, anchorX:0.5, anchorY:0.5})
        })
        socket.on('waveStarted', (wave:number) => {
            setWave(wave)
            activeMotion('globalText', lng(lang, 'waveStarted'), 1500, [
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
        socket.on('motion', (type:string, x:number, y:number, value?:string) => {
            const motion = type.split('-')[0]
            const target = type.split('-')[1]
            switch(motion){
                case 'enemyDamaged':
                    const damage = +(value || 0);
                    if(damage < 3) return;
                    const color = gradient(0, 1200, damage, 0xFFFF00, 0xFF0000);
                    const size = gradient(0, 1200, damage, 12, 32);
                    activeMotion('text', `${damage}`, 1000, [
                        {type:'y', startValue:y, endValue:y - 0.2, duration:500, delay:0, ease:'easeOutCubic'},
                        {type:'y', startValue:y - 0.2, endValue:y - 0.2, duration:500, delay:500, ease:'linear'},
                        {type:'opacity', startValue:1, endValue:0, duration:300, delay:700, ease:'easeInCubic'},
                    ], {x:x, y:y, rotation:0, scale:1, opacity:1, anchorX:0.5, anchorY:0.5},
                    {fill:color, fontSize:isMobile ? size : size*2, fontWeight:900, fontFamily:'Arial', align:'center', dropShadow:true, dropShadowBlur:10, dropShadowAngle:0, dropShadowDistance:0} as any
                    )
                    break;
            }
        })

        let timelineloop = setInterval(() => {
            setTimeline(Date.now())
        }, 1000/60)
        
        const dragStart = (e:MouseEvent) => {
            if(e.target instanceof HTMLCanvasElement){
                setDragging(true)
                setDraggingStart([e.clientX, e.clientY])
            };
        }
        const drag = (e:MouseEvent) => {
            if(e.target instanceof HTMLCanvasElement){
                setCurDrag([e.clientX, e.clientY])
            };
        }
        const drop = (e:MouseEvent) => {
            setDragging(false)
        }
        const touchStart = (e:TouchEvent) => {
            if(e.target instanceof HTMLCanvasElement){
                setDragging(true)
                setCurDrag([e.touches[0].clientX, e.touches[0].clientY])
                setDraggingStart([e.touches[0].clientX, e.touches[0].clientY])
            };
        }
        const touchMove = (e:TouchEvent) => {
            if(e.target instanceof HTMLCanvasElement){
                setCurDrag([e.touches[0].clientX, e.touches[0].clientY])
            };
        }
        const touchEnd = (e:TouchEvent) => {
            setDragging(false)
        }
        document.addEventListener('mousedown', dragStart)
        document.addEventListener('mousemove', drag)
        document.addEventListener('mouseup', drop)
        document.addEventListener('touchstart', touchStart)
        document.addEventListener('touchmove', touchMove)
        document.addEventListener('touchend', touchEnd)
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
            document.removeEventListener('touchstart', touchStart)
            document.removeEventListener('touchmove', touchMove)
            document.removeEventListener('touchend', touchEnd)
        }
    }, [once, socket])

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
        const md = (e:MouseEvent) => {
            setLastViewport([viewport[0], viewport[1]])
        }
        const td = (e:TouchEvent) => {
            setLastViewport([viewport[0], viewport[1]])
        }
        document.addEventListener('mousedown', md)
        document.addEventListener('touchstart', td)
        return () => {
            document.removeEventListener('mousedown', md)
            document.removeEventListener('touchstart', td)
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

    const activeMotion = (type:"sprite"|"text"|"globalText", value:string, duration:number, motions:IMotion[], defaultOptions:IDefaultOptions, options?:PIXI.TextStyle) => {
        if(type == "sprite"){
            setSpriteQueue({start:Date.now(), value, duration, motions, defaultOptions})
        } else if(type == "text") {
            setTextQueue({start:Date.now(), value, duration, motions, defaultOptions, options:options ||
            {fill:0xFFFFFF, fontSize:isMobile ? 48 : 96, fontWeight:900, fontFamily:'Arial', align:'center', dropShadow:true, dropShadowBlur:10, dropShadowAngle:0, dropShadowDistance:0}})
        } else if(type == "globalText") {
            setGlobalTextQueue({start:Date.now(), value, duration, motions, defaultOptions, options:options ||
            {fill:0xFFFFFF, fontSize:isMobile ? 48 : 96, fontWeight:900, fontFamily:'Arial', align:'center', dropShadow:true, dropShadowBlur:10, dropShadowAngle:0, dropShadowDistance:0}})
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
        console.log(motionTexts)
        setTextQueue(undefined)
    }, [textQueue, motionTexts])

    useEffect(() => {
        if(!globalTextQueue) return
        setMotionGlobalTexts([...motionGlobalTexts, globalTextQueue])
        setGlobalTextQueue(undefined)
    }, [globalTextQueue, motionGlobalTexts])

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
        socket.emit('userSelect', {x:selectedPos[0], y:selectedPos[1], type:selectedUnit, socketId:socket.id})
    }, [selectedPos, selectedUnit])

    useEffect(() => {
        if(!game) return
        setTileSize(Math.min(width, height) / game.size * zoom)
    }, [game, width, height, zoom])

    useEffect(() => {
        if(!game) return
        if(health != lastHealth){
            setTakenDamage(health - lastHealth)
            setLastHealth(health)
            setHealthAniTimeStart(Date.now())
            setHealthAniTimeEnd(Date.now() + 500)
        }
    }, [health, lastHealth])

    return (<>
        {/* Stage */}
        {game ? <><Stage width={width} height={height}>
            <Container pivot={[-width/2 + viewport[0], -height/2 + viewport[1]]}>
                <Tilemap
                    tileset="assets/tiles/grass.png"
                    notileset="assets/tiles/dirt.png"
                    tilemapData={game.path}
                    tileSize={tileSize}
                    size={game.size}
                />
                {unitDatas.map((unit, index) => {
                    return (
                        <Sprite
                            key={index}
                            x={unit.x * tileSize - game.size * tileSize/2 + tileSize/2}
                            y={unit.y * tileSize - game.size * tileSize/2 + tileSize/2}
                            angle={unit.angle / Math.PI * 180}
                            texture={PIXI.Texture.from(`assets/units/top/${unit.type}.png`)}
                            width={tileSize}
                            height={tileSize}
                            anchor={0.5}
                        />
                    );
                })}
                {enemyDatas.map((enemy, index) => {
                    let tint = 0xFFFFFF;
                    if(enemy.status.includes('poison')) tint = 0x44FF44;
                    if(enemy.status.includes('fire')) tint = 0xFF9900;
                    if(enemy.status.includes('bleed')) tint = 0xFF0000;
                    if(enemy.status.includes('slow')) tint = 0x0088FF;
                    if(enemy.status.includes('stun')) tint = 0xFFFF00;
                    return <>
                        <Sprite
                            key={index}
                            x={enemy.x * tileSize - game.size * tileSize/2 + tileSize/2}
                            y={enemy.y * tileSize - game.size * tileSize/2 + tileSize/2}
                            texture={PIXI.Texture.from(`assets/enemies/${enemy.type}.webp`)}
                            width={tileSize}
                            height={tileSize}
                            tint={tint}
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
                {projectileDatas.map((projectile, index) => {
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
                    return <Text key={index} text={animation.value} x={(props.x - game.size/2 + 0.5)*tileSize} y={(props.y - game.size/2 + 0.5)*tileSize} rotation={props.rotation}
                    scale={props.scale} alpha={props.opacity} anchor={[props.anchorX, props.anchorY]} style={animation.options} />
                })}
            </Container>
            {motionGlobalTexts.map((animation, index) => {
                let delta = timeline - animation.start
                if(delta > animation.duration){
                    setMotionGlobalTexts(motionGlobalTexts.filter((_, i) => i != index))
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
                return <Text key={index} text={animation.value} x={props.x + width/2} y={props.y + height/2} rotation={props.rotation}
                scale={props.scale} alpha={props.opacity} anchor={[props.anchorX, props.anchorY]} style={animation.options} />
            })}
        </Stage>
        {/* Player's Selector */}
        {selectors.map((v, i) => {
            return <div key={i} className="absolute border-2 border-white" style={{width:tileSize, height:tileSize,
            left:v.x * tileSize + width/2 - (game.size * tileSize)/2 - viewport[0],
            top:v.y * tileSize + height/2 - (game.size * tileSize)/2 - viewport[1],
            backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundImage: v.type ? `url("assets/units/${v.type}.png")` : '', opacity:'0.5'}}></div>
        })}
        {/* My Selector */}
        {selectedPos[0] != -1 && <div className="absolute border-2 border-yellow-300" style={{width:tileSize, height:tileSize,
            left:selectedPos[0] * tileSize + width/2 - (game.size * tileSize)/2 - viewport[0],
            top:selectedPos[1] * tileSize + height/2 - (game.size * tileSize)/2 - viewport[1],
            backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundImage: selectedUnit ? `url("assets/units/${selectedUnit}.png")` : '', opacity:'0.5'}}
            onClick={e => {
                setSelectedPos([-1, -1])
                setSelectedUnit('')
        }}></div>}
        {/* Radius */}
        {selectedPos[0] != -1 && selectedUnit && [''].map((_v) => {
            let radius = global.units.find(v => v.type == selectedUnit)?.range[0] || 0
            radius *= 2;
            return <div className="absolute border-2 border-yellow-300 rounded-full pointer-events-none" style={{
                width:tileSize * radius, height:tileSize * radius,
                left:selectedPos[0] * tileSize + width/2 - (game.size * tileSize)/2 - viewport[0] - tileSize * radius/2 + tileSize/2,
                top:selectedPos[1] * tileSize + height/2 - (game.size * tileSize)/2 - viewport[1] - tileSize * radius/2 + tileSize/2,
                opacity:'0.5'}}
            ></div>
        })}
        {selectedPos[0] != -1 && !selectedUnit && unitDatas.find(v => v.x == selectedPos[0] && v.y == selectedPos[1]) && [''].map((_v) => {
            const target = unitDatas.find(v => v.x == selectedPos[0] && v.y == selectedPos[1])
            let radius = global.units.find(v => v.type == target?.type)?.range[(target?.lvl as number) - 1] || 0
            radius *= 2;
            return <div className="absolute border-2 border-yellow-300 rounded-full pointer-events-none" style={{
                width:tileSize * radius, height:tileSize * radius,
                left:selectedPos[0] * tileSize + width/2 - (game.size * tileSize)/2 - viewport[0] - tileSize * radius/2 + tileSize/2,
                top:selectedPos[1] * tileSize + height/2 - (game.size * tileSize)/2 - viewport[1] - tileSize * radius/2 + tileSize/2,
                opacity:'0.5'}}
            ></div>
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
        {/* Zoom */}
        <div className={`absolute text-white right-0 bottom-0 flex flex-col font-semibold p-1 gap-1 lg:p-2 lg:gap-2 box ${user.admin ? "bottom-24 lg:bottom-28" : ""}`}>
            {/* Progress bar to make zoom */}
            <div className="h-6 lg:h-8 w-32 lg:w-40 bg-[#ffffff22] rounded-md" onTouchMove={e => {
                setZoom((e.touches[0].clientX - width/2) / width * 2 + 1.5)
            }}>
                {[''].map((v) => {
                    return <div key={v} className="h-full bg-[#ffffff99] rounded-md" style={{width:`${Math.min((zoom-0.5) * 50, 100)}%`}}></div>
                })}
            </div>
        </div>
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
            <div className="absolute bottom-0 right-0 text-white text-lg lg:text-2xl font-bold">{lng(lang, 'waiting for players')}...</div>
        </div>
        }
    </>)
}

export default Play