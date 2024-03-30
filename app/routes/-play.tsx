import { Stage, Container, Sprite } from "@pixi/react"
import { FC, useEffect, useRef, useState } from "react"
import * as usehooks from "usehooks-ts"
import * as PIXI from 'pixi.js';
import { lng } from "~/data/lang"

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
    const [game, setGame] = useState<GameInitData>()
    const [tileSize, setTileSize] = useState<number>(Math.min(width, height) / (game || {size:1}).size)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [units, setUnits] = useState<UnitData[]>([])
    const [enemies, setEnemies] = useState<EnemyData[]>([])
    const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
    const [waiting, setWaiting] = useState<number>(0)
    const [health, setHealth] = useState<number>(0)
    const [wave, setWave] = useState<number>(0)
    const [coin, setCoin] = useState<number>(0)
    const [titleEvent, setTitleEvent] = useState<string>('')
    const [selectedPos, setSelectedPos] = useState<[number, number]>([-1, -1])
    const [selectedUnit, setSelectedUnit] = useState<string>('')
    const [selectors, setSelectors] = useState<UserSelectionData[]>([])

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        if(!socket) return
        socket.emit('ready', user.id)
        socket.on('gameInit', (game:GameInitData) => {
            setGame(game)
        })
        socket.on('usersUpdate', (users:InRoomUser[]) => {
            setCoin(users.find(u => u.socketId === socket.id)?.coin || 0)
        })
        socket.on('coinUpdate', (coin:number) => {
            setCoin(coin)
        })
        socket.on('gameUpdate', (tickData:GameTickData) => {
            setUnits(tickData.units)
            setEnemies(tickData.enemies)
            setProjectiles(tickData.projectiles)
            setHealth(tickData.health)
            setWaiting(tickData.waitingTimer)
        })
        socket.on('roomDeleted', () => {
            set('main')
        })
        socket.on('gameOver', (wave:number) => {
            setWave(wave)
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
        socket.on('gameComplete', () => {
            setTitleEvent('gamecomplete')
            set('main')
        })
        socket.on('userSelection', (data:UserSelectionData[]) => {
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
                    return (
                        <Sprite
                            key={index}
                            x={enemy.x * tileSize - game.size * tileSize/2 + tileSize/2}
                            y={enemy.y * tileSize - game.size * tileSize/2 + tileSize/2}
                            texture={PIXI.Texture.from(`assets/enemies/${enemy.type}.webp`)}
                            width={tileSize}
                            height={tileSize}
                            anchor={0.5}
                        />
                    );
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
        {selectedPos[0] != -1 && <div className="absolute text-white left-0 top-0 flex flex-col font-semibold p-2 gap-2 box">
            {user.equipped.map((unit, index) => {
                return <button key={index} className="noshadow p-1" onClick={e => {
                    setSelectedUnit(unit)
                }}>{lng(lang, unit)}</button>
            })}
            <button className="noshadow p-1" onClick={e => {
                setSelectedPos([-1, -1])
                socket.emit('placeUnit', {x:selectedPos[0], y:selectedPos[1], type:selectedUnit})
            }}>{lng(lang, 'place')}</button>
        </div>}
        </>:
        <div className="cover" style={{backgroundImage: `url(assets/tiles/grass.png)`}}>
            <div className="absolute bottom-0 right-0 text-white text-2xl font-bold">{lng(lang, 'loading')}</div>
        </div>
        }
    </>)
}

export default Play