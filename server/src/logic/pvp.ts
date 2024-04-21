import { EventEmitter } from 'events';
import { Unit } from './unit';
import { Enemy } from './enemy';
import { Projectile } from './projectile';

export class PVP{
    eventEmitter: EventEmitter;
    teams: [];

    constructor(players:number){
        this.eventEmitter = new EventEmitter();
    }
}
