import { Stage, Container, Sprite, Graphics } from "@pixi/react"
import { FC, useEffect, useRef, useState } from "react"
import * as usehooks from "usehooks-ts"
import * as PIXI from 'pixi.js';
import { lng } from "~/data/lang"
import { units as AllUnits } from "~/data/db";

const Tilemap: FC<{
    tileset: string;
    tilemapData: [number, number][];
    tileSize: number;
    size: number;
  }> = ({ tileset, tilemapData, tileSize, size }) => {

    return tilemapData.map((tile, index) => {
        return (
            <Sprite
                key={index}
                x={tile[0] * tileSize - size * tileSize/2}
                y={tile[1] * tileSize - size * tileSize/2}
                texture={PIXI.Texture.from(tileset)}
                width={tileSize}
                height={tileSize}
            />
        );
    });
};

const Play:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket}) => {
    const {width, height} = usehooks.useWindowSize()
    const [once, setOnce] = useState<boolean>(false)
    const [game, setGame] = useState<IGameInitData>()
    const [tileSize, setTileSize] = useState<number>(Math.min(width, height) / (game || {size:1}).size)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [units, setUnits] = useState<IUnitData[]>([])
    const [enemies, setEnemies] = useState<IEnemyData[]>([])
    const [projectiles, setProjectiles] = useState<IProjectileData[]>([])
    const [waiting, setWaiting] = useState<number>(0)
    const [health, setHealth] = useState<number>(0)
    const [wave, setWave] = useState<number>(0)
    const [coin, setCoin] = useState<number>(0)
    const [titleEvent, setTitleEvent] = useState<string>('')
    const [selectedPos, setSelectedPos] = useState<[number, number]>([-1, -1])
    const [selectedUnit, setSelectedUnit] = useState<string>('')
    const [selectors, setSelectors] = useState<IUserSelectionData[]>([])
    const [text, setText] = useState<string>('')

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
        socket.on('waveComplete', (wave:number) => {
            setWave(wave)
            setTitleEvent('wavecomplete')
        })
        socket.on('waveStarted', (wave:number) => {
            setWave(wave)
            setTitleEvent('wavestarted')
        })
        socket.on('gameOver', (level:number, wave:number) => {
            setTitleEvent('gameover')
            fetch(`/updateUser/id/${user.id}/level/${level}/wave/${wave}/maxwave/${_game.maxWave}/clear/false`).then(res => res.json()).then((res:{res:IUser}) => {
                setUser(res.res)
                set('main')
            }).catch(e => {
                console.log(e)
            })
        })
        socket.on('gameComplete', (level:number) => {
            setTitleEvent('gamecomplete')
            fetch(`/updateUser/id/${user.id}/level/${level}/wave/${_game.maxWave}/maxwave/${_game.maxWave}/clear/true`).then(res => res.json()).then((res:{res:IUser}) => {
                setUser(res.res)
                set('main')
            }).catch(e => {
                console.log(e)
            })
        })
        socket.on('userSelection', (data:IUserSelectionData[]) => {
            setSelectors(data.filter(d => d.x != selectedPos[0] && d.y != selectedPos[1]))
        })
        return () => {
            socket.off('gameInit')
            socket.off('userInit')
            socket.off('gameUpdate')
            socket.off('roomDeleted')
            socket.off('gameOver')
            socket.off('waveComplete')
            socket.off('waveStarted')
            socket.off('gameComplete')
            socket.off('userSelection')
        }
    }, [once, socket])

    useEffect(() => {
        if(!game) return
        const click = (e:MouseEvent) => {
            if((e.target as HTMLElement).nodeName == "CANVAS"){
                let x = Math.floor((e.clientX - width/2) / tileSize + game.size/2)
                let y = Math.floor((e.clientY - height/2) / tileSize + game.size/2)
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
    }, [game, width, height, tileSize, selectors])

    useEffect(() => {
        if(!game) return
        setTileSize(Math.min(width, height) / game.size)
    }, [game, width, height])

    useEffect(() => {
        if(titleEvent){
            setTimeout(() => {
                setTitleEvent('')
            }, 2000);
        }
    }, [titleEvent])

    return (<>
        {game ? <><Stage width={width} height={height}>
            <Container pivot={[-width/2, -height/2]}>
                <Tilemap
                    tileset="assets/tiles/grass.png"
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
                            anchor={0.5}
                        />
                        <Graphics draw={g => {
                            g.clear();
                            g.lineStyle(2, 0x000000, 1);
                            g.beginFill(0xFF0000);
                            g.drawRect(enemy.x * tileSize - game.size * tileSize/2 + tileSize/2 - tileSize/2, enemy.y * tileSize - game.size * tileSize/2, tileSize, 5);
                            g.endFill();
                            g.beginFill(0x00FF00);
                            g.drawRect(enemy.x * tileSize - game.size * tileSize/2 + tileSize/2 - tileSize/2, enemy.y * tileSize - game.size * tileSize/2, tileSize * (enemy.health / 100), 5);
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
            </Container>
        </Stage>
        {titleEvent && <div className="absolute w-full h-full flex justify-center items-center text-white text-4xl top-0 left-0 right-0 text-center font-semibold">
            {lng(lang, titleEvent)}
        </div>}
        <div className="absolute border-2 border-white" style={{width:tileSize, height:tileSize,
        left:selectedPos[0] * tileSize + width/2 - (game.size * tileSize)/2,
        top:selectedPos[1] * tileSize + height/2 - (game.size * tileSize)/2,
        backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundImage: selectedUnit ? `url("assets/units/${selectedUnit}.png")` : ''}}></div>
        <div className="absolute text-white right-0 top-0 flex flex-col font-semibold p-2 gap-2 box text-right">
            <div>{lng(lang, 'wave')} : {wave}</div>
            <div>{lng(lang, 'waitingfornextwave')} : {Math.floor(waiting/1000)}s <button className="noshadow p-1"
            onClick={e => {socket.emit('skipWave')}}>{lng(lang, 'skipwave')}</button></div>
            <div>{lng(lang, 'health')} : {health}</div>
            <div>{lng(lang, 'coin')} : {coin}</div>
        </div>
        {selectedPos[0] != -1 && !selectedUnit && <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-2 gap-2 box w-38">
            {user.equipped.map((unit:string, index:number) => {
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
        {selectedPos[0] != -1 && selectedUnit && <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-2 gap-2 box w-38">
            <div className="flex flex-row items-center justify-between gap-3">
                <img src={`assets/units/${selectedUnit}.png`} className="w-8 h-8 rounded-md" />
                <div>{lng(lang, selectedUnit)}</div>
            </div>
            <div className="p-2">{lng(lang, 'damage')} {AllUnits.find(v => v.type == selectedUnit)?.damage[0]}</div>
            <div className="p-2">{lng(lang, 'range')} {AllUnits.find(v => v.type == selectedUnit)?.range[0]}m</div>
            <div className="p-2">{lng(lang, 'rate')} {(AllUnits.find(v => v.type == selectedUnit)?.rate as number[])[0]/1000}s</div>
            <div className="p-2">{lng(lang, 'cost')} {AllUnits.find(v => v.type == selectedUnit)?.cost}c</div>
            <button className="noshadow p-1 text-white" onClick={e => {
                setSelectedUnit('')
            }}>{lng(lang, 'cancel')}</button>
            <button className={`noshadow p-1 ${coin - (AllUnits.find(v => v.type == selectedUnit)?.cost as number) >= 0 ? 'text-white' : 'text-red-700'}`}
            onClick={e => {
                socket.emit('placeUnit', {x:selectedPos[0], y:selectedPos[1], type:selectedUnit})
                setSelectedUnit('')
            }}>{lng(lang, 'place')}</button>
        </div>}
        {user.admin && <div className="absolute text-white right-0 bottom-0 flex flex-col font-semibold p-2 gap-2 box">
            <input className="noshadow p-1" type="text" value={text} onChange={e => setText(e.target.value)} />
            <button className="noshadow p-1 text-white" onClick={e => {
                socket.emit('gameCommand', text)
                setText('')
            }}>Admin</button>
        </div>}
        </>:
        <div className="cover" style={{backgroundImage: `url(assets/tiles/grass.png)`}}>
            <div className="absolute bottom-0 right-0 text-white text-2xl font-bold">{lng(lang, 'loading')}</div>
        </div>
        }
    </>)
}

export default Play