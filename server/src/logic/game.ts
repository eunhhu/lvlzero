import { EventEmitter } from 'events';
import { Unit } from './unit';
import { Enemy } from './enemy';
import { Projectile } from './projectile';

export class Game{
    wave:number = 0;
    size:number = 20;
    health:number = 1000;
    maxHealth:number = 1000;
    path:[number, number][] = [];
    level:number = 0;
    maxWave:number = 10;

    maxHealthLvl:number = 0;
    healthRegenLvl:number = 0;
    regenTickCooldown:number = 1000;

    units:Unit[] = [];
    enemies:Enemy[] = [];
    projectiles:Projectile[] = [];

    loop:NodeJS.Timeout;
    spawnInterval:NodeJS.Timeout;
    event:EventEmitter = new EventEmitter();

    usePinnedQueue:boolean = false;
    pinnedQueue:Enemy[] = [];
    enemySpawnQueue:Enemy[] = [];

    defaultCoin:number = 1000;
    waveCoin:number = 100;
    enemySpawnInterval = 1000
    waitingTimer:number = 0;
    waitingTimerMax:number = 10000;
    status:"waiting"|"started" = "waiting"
    lastTick: number = Date.now();

    players:InGameUser[] = [];

    constructor(){
        this.generatePath();

        this.on('userSelect', (socketId:string, data:IUserSelectionData) => {
            let player = this.players.find(player => player.socketId === socketId);
            if(player){
                player.selection = data;
                this.emit('userSelection', this.players.map(player => player.selection));
            }
        })

        this.on('placeUnit', (socketId:string, data:{x:number, y:number, type:string, modules:IModule[]}, units:IUnit[]) => {
            let player = this.players.find(player => player.socketId === socketId);
            if(player){
                if(player.coin >= units.find(unit => unit.type === data.type).cost){
                    player.coin -= units.find(unit => unit.type === data.type).cost;
                    this.emit('usersUpdate', this.players);
                    let unit = this.placeUnit(units, data.x, data.y, data.type, data.modules);
                }
            }
        })

        this.on('upgradeUnit', (socketId:string, data:{x:number, y:number}, units:IUnit[]) => {
            let player = this.players.find(player => player.socketId === socketId);
            if(player){
                const unit:IUnitData = this.findUnit(data.x, data.y)
                if(!unit) return;
                const unitData:IUnit = units.find(v => v.type == unit.type)
                if(unit){
                    const cost = unitData.upgradeCost[unit.lvl - 1];
                    if(player.coin < cost) return;
                    this.upgradeUnit(data.x, data.y)
                    player.coin -= cost;
                    this.emit('usersUpdate', this.players);
                }
            }
        })

        this.on('sellUnit', (socketId:string, data:{x:number, y:number}, units:IUnit[]) => {
            let player = this.players.find(player => player.socketId === socketId);
            if(player){
                const unit:IUnitData = this.findUnit(data.x, data.y)
                if(!unit) return;
                const unitData:IUnit = units.find(v => v.type == unit.type)
                if(unit){
                    const allUpgCosts = unit.lvl == 1 ? 0 : unit.lvl == 2 ? unitData.upgradeCost[0] : unitData.upgradeCost.slice(0, unit.lvl-1).reduce((a, b) => a + b)
                    const sellCost = Math.round((unitData.cost + allUpgCosts)/2);
                    this.sellUnit(data.x, data.y)
                    player.coin += sellCost;
                    this.emit('usersUpdate', this.players);
                }
            }
        })

        this.on('upgradeHealth', (socketId:string) => {
            let player = this.players.find(player => player.socketId === socketId);
            if(player){
                const cost = (this.maxHealthLvl + 1) * 500
                if(player.coin < cost) return;
                this.upgradeHealth();
                player.coin -= cost;
                this.emit('usersUpdate', this.players);
            }
        })

        this.on('upgradeHealthRegen', (socketId:string) => {
            let player = this.players.find(player => player.socketId === socketId);
            if(player){
                const cost = (this.healthRegenLvl + 1) * 800
                if(player.coin < cost) return;
                this.upgradeRegen();
                player.coin -= cost;
                this.emit('usersUpdate', this.players);
            }
        })
    }

    generatePath() {
        let cur:[number, number] = [0, 0];
        this.path.push([...cur]);
        cur = [1, 0];
        this.path.push([...cur]);
        cur = [1, 1];
        this.path.push([...cur]);

        let g = 0

        while (cur[0] < this.size - 2 || cur[1] < this.size - 2) {
            if (cur[0] < this.size - 2 && cur[1] < this.size - 2) {
                if (Math.random() < (g ? 0.4 : 0.6)) {
                    g = 0
                    cur[0]++;
                } else {
                    g = 1
                    cur[1]++;
                }
            } else if (cur[0] < this.size - 2) {
                cur[0]++;
            } else {
                cur[1]++;
            }
            this.path.push([...cur]);
        }

        cur = [this.size - 1, this.size - 2];
        this.path.push([...cur]);
        cur = [this.size - 1, this.size - 1];
        this.path.push([...cur]);
    }

    init(levels:ILevel[], lvl:number = 1){
        this.lastTick = Date.now();
        this.level = lvl;
        this.maxWave = levels.find(v => v.level == lvl).enemyRegexes.length;
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.units = [];
        this.enemies = [];
        this.projectiles = [];
        this.wave = 0;
        this.status = "waiting";
        this.waitingTimer = this.waitingTimerMax * 2;
    }

    start(levels:ILevel[], enemies:IEnemy[], users:IInRoomUser[]){
        this.lastTick = Date.now();
        this.players = users.map(user => {
            return {
                id: user.id,
                username: user.username,
                lvl: user.lvl,
                socketId: user.socketId,
                coin: this.defaultCoin,
                selection: {
                    x: -1,
                    y: -1,
                    type: '',
                    socketId: user.socketId
                }
            }
        });
        this.emit('gameInit', this.getInitData());
        this.emit('usersUpdate', this.players);
        this.run(levels, enemies);
    }

    giveAllCoin(coin:number){
        this.players.forEach(player => {
            player.coin += coin;
        });
        this.emit('usersUpdate', this.players);
    }

    giveCoinToPlayer(socketId:string, coin:number){
        const player = this.players.find(player => player.socketId === socketId);
        if(player){
            player.coin += coin;
            this.emit('usersUpdate', this.players);
        }
    }

    on(event:string, listener:(...args: any[]) => void){
        this.event.on(event, listener);
    }

    off(event:string, listener:(...args: any[]) => void){
        this.event.off(event, listener);
    }

    emit(event:string, ...args:any[]){
        this.event.emit(event, ...args);
    }

    getInitData():IGameInitData{
        return {
            size: this.size,
            path: this.path,
            maxWave: this.maxWave,
            maxHealth: this.maxHealth,
            maxHealthLvl: this.maxHealthLvl,
            healthRegenLvl: this.healthRegenLvl
        }
    }

    getTickData():IGameTickData{
        return {
            health: this.health,
            units: this.units.map(unit => unit.getTickData()),
            enemies: this.enemies.map(enemy => enemy.getTickData()),
            projectiles: this.projectiles.map(projectile => projectile.getTickData()),
            waitingTimer: this.waitingTimer
        }
    }

    gameOver(levels:ILevel[]):void {
        clearInterval(this.loop);
        this.emit('gameOver', this.level, this.wave);
        this.init(levels);
    }

    gameComplete(levels:ILevel[]):void {
        clearInterval(this.loop);
        this.emit('gameComplete', this.level);
        this.init(levels);
    }

    tick(levels:ILevel[], enemies:IEnemy[], delta: number):void {
        if (this.status === "waiting") {
            this.waitingTimer -= delta;
            if (this.waitingTimer <= 0) {
                const lvl = levels.find(v => v.level == this.level);
                const enems:Enemy[] = this.parseEnemyRegex(lvl.enemyRegexes[this.wave]).map((enemyType:string) => {
                    const enemyData = enemies.find(enemy => enemy.type === enemyType);
                    let enemy:Enemy;
                    if (!enemyData) enemy = new Enemy(0, 0, 0.05, 100, 'basic', this.path);
                    enemy = new Enemy(0, 0, enemyData.speed, enemyData.health, enemyType, this.path);
                    enemy.on('dead', (type:string) => {
                        this.giveAllCoin(Math.round(enemies.find(enemy => enemy.type === type).coin / this.players.length));
                    });
                    enemy.on('motion-killed', (x:number, y:number) => {
                        this.emit('motion', `enemyKilled-${enemy.type}`, x, y);
                    })
                    enemy.on('motion-damaged', (x:number, y:number, damage:number) => {
                        this.emit('motion', `enemyDamaged-${enemy.type}`, x, y, `${damage}`);
                    })
                    return enemy;
                });
                this.startWave(enems);
            }
        } else { // 게임이 진행 중일 때
            // 적 업데이트
            this.enemies.forEach(enemy => {
                enemy.tick(delta, this.enemies);
            });

            // 유닛 및 발사체 업데이트
            this.units.forEach(unit => unit.tick(delta, this.enemies, this.projectiles));
            this.projectiles.forEach((projectile, index) => {
                projectile.tick(delta, this.enemies, this.projectiles);
                if (projectile.isOutOfBounds(this.size)) {
                    this.projectiles.splice(index, 1); // 화면 밖으로 나간 발사체 제거
                }
            });

            // 적이 모두 제거되었는지 확인
            if (this.enemies.length === 0 && this.enemySpawnQueue.length === 0) {
                this.giveAllCoin(this.waveCoin);
                this.emit('waveComplete', this.wave);
                this.projectiles = [];
                this.status = "waiting";
                this.waitingTimer = this.waitingTimerMax;
                if (this.wave >= this.maxWave) {
                    this.gameComplete(levels);
                }
            }

            // 적이 목적지에 도달하면 체력 감소
            this.enemies.forEach((enemy, index) => {
                if (enemy.path.length === 0) {
                    this.health -= enemy.health;
                    this.enemies.splice(index, 1);
                }
            });

            // 게임 오버 조건 검사
            if (this.health <= 0) {
                this.gameOver(levels);
            }
        }
        if(this.healthRegenLvl > 0){
            this.regenTickCooldown -= delta;
            if(this.regenTickCooldown <= 0){
                this.health += this.healthRegenLvl * 5;
                if(this.health > this.maxHealth){
                    this.health = this.maxHealth;
                }
                this.regenTickCooldown = 1000;
            }
        }
    }

    upgradeHealth(){
        if(this.maxHealthLvl < 3){
            this.maxHealthLvl++;
            this.maxHealth = 1000 + this.maxHealthLvl * 500;
            this.health += 500;
            this.emit('healthUpgraded', this.maxHealthLvl, this.maxHealth);
        }
    }

    upgradeRegen(){
        if(this.healthRegenLvl < 3){
            this.healthRegenLvl++;
            this.emit('healthRegenUpgraded', this.healthRegenLvl);
        }
    }

    parseEnemyRegex(enemyRegex:string):string[]{
        const regexes = enemyRegex.split(',');
        const enemies:string[] = [];
        regexes.forEach(regex => {
            const [enemyType, count] = regex.split(':');
            for(let i=0; i < +count; i++){
                enemies.push(enemyType);
            }
        });
        return enemies;
    }

    stringifyEnemyRegex(enemies:string[]):string{
        let enemyCounts:{[key:string]:number} = {};
        enemies.forEach(enemy => {
            if(enemyCounts[enemy]){
                enemyCounts[enemy]++;
            }else{
                enemyCounts[enemy] = 1;
            }
        });
        return Object.entries(enemyCounts).map(([enemy, count]) => `${enemy}:${count}`).join(',');
    }

    startWave(enemies: Enemy[]) {
        this.wave++;
        this.status = "started";
        this.enemySpawnQueue = enemies;
        this.emit('waveStarted', this.wave);

        const spawnEnemy = () => {
            if (this.enemySpawnQueue.length > 0) {
                const enemy = this.enemySpawnQueue.shift();
                if (enemy) {
                    this.enemies.push(enemy);
                }
            } else {
                clearInterval(this.spawnInterval);
                // 모든 적이 제거되었을 때 새로운 웨이브를 시작하거나 게임을 종료하기 위한 조건을 여기에 추가할 수 있습니다.
            }
        };

        // 정해진 간격으로 대기열에서 적을 생성
        const spawnInterval = setInterval(spawnEnemy, this.enemySpawnInterval);
        this.spawnInterval = spawnInterval;
    }

    placeUnit(units:IUnit[], x: number, y: number, unitType: string, modules:IModule[] = []) {
        // 유닛을 배치하는 예시 메서드, 실제 구현은 유닛 유형과 게임 로직에 따라 달라질 것입니다
        if (this.units.some(unit => unit.x === x && unit.y === y)) {
            return this.emit('unitPlacementFailed', 'A unit already exists at the specified location');
        }

        const unitData:IUnit = units.find(unit => unit.type === unitType);
        const newUnit = new Unit(x, y,
            unitData.damage,
            unitData.rate,
            unitData.range,
            unitData.bulletSpeed,
            unitData.upgradeCost,
            unitData.cost,
            unitData.tags,
            modules,
            unitType, 1);
        newUnit.on('motion-hit', (type:string, x:number, y:number) => {
            this.emit('motion', `projHit-${type}`, x, y);
        })
        newUnit.on('motion-fire', (type:string, x:number, y:number) => {
            this.emit('motion', `unitFire-${type}`, x, y);
        })
        this.units.push(newUnit);
        this.emit('unitPlaced', newUnit);
        return newUnit;
    }

    sellUnit(x: number, y: number) {
        const index = this.units.findIndex(unit => unit.x === x && unit.y === y);
        if (index !== -1) {
            const unit = this.units[index];
            this.units.splice(index, 1);
            this.emit('unitSold', unit);
            return unit;
        }
    }

    upgradeUnit(x: number, y: number) {
        let unit = this.units.find(unit => unit.x === x && unit.y === y);
        if (unit) {
            unit.lvl++;
            this.emit('unitUpgraded', unit);
            return unit;
        }
    }
    
    findUnit(x:number, y:number){
        return this.units.find(unit => unit.x === x && unit.y === y);
    }

    skipWave() {
        if(this.status === "waiting"){
            this.waitingTimer = 0;
        }
    }

    run(levels:ILevel[], enemies:IEnemy[]) {
        const runTick = () => {
            const now = Date.now();
            const delta = now - this.lastTick;
            this.lastTick = now;
            this.tick(levels, enemies, delta);
            this.emit('tick', this.getTickData());
        };

        this.loop = setInterval(runTick, 1000/60);
    }

    command(units:IUnit[], levels:ILevel[], command:string){
        const params = command.split(' ');
        const commander = params[0];
        switch(commander){
            case 'place':
                if(params.length < 4) return;
                if(+params[1] < 0 || +params[1] >= this.size || isNaN(+params[1])) return;
                if(+params[2] < 0 || +params[2] >= this.size || isNaN(+params[2])) return;
                if(!units.find(unit => unit.type === params[3])) return;
                this.placeUnit(units, parseInt(params[1]), parseInt(params[2]), params[3]);
                break;
            case 'sell':
                if(params.length < 3) return;
                if(+params[1] < 0 || +params[1] >= this.size || isNaN(+params[1])) return;
                if(+params[2] < 0 || +params[2] >= this.size || isNaN(+params[2])) return;
                this.sellUnit(parseInt(params[1]), parseInt(params[2]));
                break;
            case 'upgrade':
                if(params.length < 3) return;
                if(+params[1] < 0 || +params[1] >= this.size || isNaN(+params[1])) return;
                if(+params[2] < 0 || +params[2] >= this.size || isNaN(+params[2])) return;
                this.upgradeUnit(parseInt(params[1]), parseInt(params[2]));
                break;
            case 'completeWave':
                clearInterval(this.spawnInterval);
                this.enemies = [];
                this.status = "waiting";
                this.waitingTimer = 0;
                this.emit('waveComplete', this.wave);
                this.projectiles = [];
                break;
            case 'skipWave':
                this.skipWave();
                break;
            case 'set':
                if(params.length < 3) return;
                switch(params[1]){
                    case 'wave':
                        if(+params[2] < 0 || isNaN(+params[2])) return;
                        this.wave = +params[2];
                        break;
                    case 'level':
                        if(+params[2] < 1 || isNaN(+params[2])) return;
                        this.level = +params[2];
                        break;
                    case 'health':
                        if(+params[2] < 0 || isNaN(+params[2])) return;
                        this.health = +params[2];
                        break;
                    case 'maxWave':
                        if(+params[2] < 1 || isNaN(+params[2])) return;
                        this.maxWave = +params[2];
                        break;
                    case 'waitingTimer':
                        if(+params[2] < 0 || isNaN(+params[2])) return;
                        this.waitingTimer = +params[2];
                        break;
                    case 'waitingTimerMax':
                        if(+params[2] < 0 || isNaN(+params[2])) return;
                        this.waitingTimerMax = +params[2];
                        break;
                    case 'enemySpawnInterval':
                        if(+params[2] < 0 || isNaN(+params[2])) return;
                        this.enemySpawnInterval = +params[2];
                        break;
                    case 'maxHealthLvl':
                        if(+params[2] < 0 || isNaN(+params[2])) return;
                        this.maxHealthLvl = +params[2];
                        break;
                    case 'healthRegenLvl':
                        if(+params[2] < 0 || isNaN(+params[2])) return;
                        this.healthRegenLvl = +params[2];
                        break;
                    default:
                        break;
                }
                break;
            case 'killAll':
                this.enemies = [];
                break;
            case 'gameOver':
                this.gameOver(levels);
                break;
            case 'gameComplete':
                this.gameComplete(levels);
                break;
            case 'emit':
                this.emit(params[1], ...params.slice(2));
                break;
            case 'giveCoin':
                if(params.length < 2) return;
                if(+params[1] < 0) return;
                if(isNaN(+params[1])) return;
                this.giveAllCoin(+params[1]);
                break;
            default:
                break;
        }
    }
}
