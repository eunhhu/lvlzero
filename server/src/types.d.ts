interface IUser{
    id: string;
    username: string;
    password: string;
    gold: number;
    lvl: number;
    exp: number;
    admin: boolean;
    banned: boolean;
    unlocked: string[];
    equipped: string[];
    unlockedModules: string[];
    equippedModules: string[][];
    avatar: string;
    win: number;
    lose: number;
    lastPvp: number;
}

interface glFCProps{
    lang:string,
    setLang:React.Dispatch<React.SetStateAction<string>>,
    set:React.Dispatch<React.SetStateAction<string>>,
    user:IUser,
    setUser:React.Dispatch<React.SetStateAction<IUser>>
    socket:SocketIOClient.Socket,
    setSocket:React.Dispatch<React.SetStateAction<SocketIOClient.Socket>>,
    global:IDB,
    isMobile:boolean
}

interface IRoom{
    name:string;
    users:IInRoomUser[];
    maxUsers:number;
    private:boolean;
    password:string;
    chats:IChat[];
    status:string; // waiting, playing
    ownerName:string;
    ownerID:string; // socket id
    game:Game;
}

interface IChat{
    socketId:string;
    username:string;
    message:string;
}

interface IInRoomUser{
    id:string;
    username:string;
    lvl:number;
    socketId:string;
    coin:number;
    ready:boolean;
    selection:IUserSelectionData;
}

interface IGameInitData{
    path:[number, number][];
    size:number;
    maxWave:number;
    maxHealth:number;
    maxHealthLvl:number;
    healthRegenLvl:number;
}

interface IGameTickData{
    health:number;
    units:UnitData[];
    enemies:EnemyData[];
    projectiles:ProjectileData[];
    waitingTimer:number;
}

interface IUnitData{
    id:number;
    x:number;
    y:number;
    angle:number;
    type:string;
    lvl:number;
    modules:IModule[];
}

interface IEnemyData{
    id:number;
    x:number;
    y:number;
    health:number;
    maxHealth:number;
    status:string[];
    type:string;
}

interface IProjectileData{
    id:number;
    x:number;
    y:number;
    angle:number;
    type:string;
}

interface IUserSelectionData{
    x:number;
    y:number;
    type:string;
    socketId:string;
}

interface IUnit{
    type:string;
    damage: number[];
    rate: number[];
    range: number[];
    bulletSpeed: number[];
    cost: number;
    upgradeCost: number[];
    buy: number;
    tags: string[];
}

interface IEnemy{
    type:string;
    health:number;
    speed:number;
    coin:number;
    tags:string[];
}

interface ILevel{
    level:number;
    enemyRegexes:string[];
    title:string;
}

interface IModule{
    type:string; // module name
    quality:number; // 0-4 "D", "C", "B", "A", "S"
    effect:IDebuff;
}

interface IMotion{
    delay:number; // ms
    duration:number; // ms
    type:motionType; // x, y, scale, rotation
    ease:string; // linear, easeIn, easeOut, easeInOut
    startValue:number; // x, y, scale, rotation
    endValue:number; // x, y, scale, rotation
}
type motionType = 'x' | 'y' | 'scale' | 'rotation' | 'opacity' | 'anchorX' | 'anchorY';

interface ISpriteAnimation{
    start:number; // Date.now()
    value:string; // sprite source
    duration:number; // ms
    motions:IMotion[];
    defaultOptions:IDefaultOptions;
}

interface ITextAnimation{
    start:number; // Date.now()
    value:string; // text
    duration:number; // ms
    motions:IMotion[];
    defaultOptions:IDefaultOptions;
    options:PIXI.TextStyle;
}

interface IFilterAnimation{
    start:number; // Date.now()
    value:string; // filter type
    duration:number; // ms
    motions:IFilterMotion[];
    defaultOptions:any; // default filter options
}

interface IFilterMotion{
    delay:number; // ms
    duration:number; // ms
    type:string; // filter's property
    ease:string; // linear, easeIn, easeOut, easeInOut
    startValue:number; // filter's strength
    endValue:number; // filter's strength
}

interface IDefaultOptions{
    x:number;
    y:number;
    scale:number;
    rotation:number;
    opacity:number;
    anchorX:number;
    anchorY:number;
}

interface IDebuff{
    type:DebuffType;
    duration:number;
    value:number;
}

type DebuffType = 'fire' | 'slow' | 'poison' | 'bleed' | 'stun' | 'weak';

interface IDB{
    users:IUser[];
    units:IUnit[];
    enemies:IEnemy[];
    levels:ILevel[];
    modules:IModule[];
}