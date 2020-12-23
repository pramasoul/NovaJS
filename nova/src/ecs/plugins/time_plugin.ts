import * as t from 'io-ts';
import { Component } from '../component';
import { Resource } from '../resource';
import { System } from '../system';
import { Plugin } from '../plugin';
import { Entity } from '../entity';

export const TimeResource = new Resource({
    name: 'time',
    type: t.type({
        delta: t.number,
        time: t.number,
    }),
    getDelta: () => undefined,
    applyDelta: () => undefined,
});

const TimeSingleton = new Component({
    name: 'singleton',
    type: t.undefined,
    getDelta: () => undefined,
    applyDelta: () => undefined,
});

// Should be a singleton system.
export const TimeSystem = new System({
    name: 'time',
    args: [TimeResource, TimeSingleton] as const,
    step: (time) => {
        // TODO: performance.now for node?
        const now = new Date().getTime();
        time.delta = now - time.time;
        time.time = now;
    }
});


export const TimePlugin: Plugin = {
    name: 'time',
    build: (world) => {
        world.addSystem(TimeSystem);
        world.addResource(TimeResource, { delta: 0, time: new Date().getTime() });
        world.commands.addEntity(new Entity()
            .addComponent(TimeSingleton, undefined));
    }
}