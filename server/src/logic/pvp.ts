import { EventEmitter } from 'events';
import { Unit } from './unit';
import { Enemy } from './enemy';
import { Projectile } from './projectile';

export class PVP{
    teams: [];
    eventEmitter: EventEmitter = new EventEmitter();

    constructor(players:number){
    }
}
