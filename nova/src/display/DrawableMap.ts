import { Drawable } from "./Drawable";
import { Position } from "../../engine/Position";
import * as PIXI from "pixi.js";


export class DrawableMap<D extends Drawable<State>, State>
    implements Drawable<[string, State][]> {

    readonly displayObject = new PIXI.Container();

    // A map of all objects drawn on the screen. `drawn`
    // keeps track of which objects were actually drawn
    // in a given frame so the ones that weren't can be
    // removed.
    private readonly uuidMap =
        new Map<string, { item: D, drawn: boolean }>();

    constructor(private readonly factory: () => D) { }

    draw(states: Iterable<[string, State]>, center: Position): boolean {
        for (const [uuid, state] of states) {
            if (!this.uuidMap.has(uuid)) {
                const item = this.factory();
                this.displayObject.addChild(item.displayObject);
                this.uuidMap.set(uuid, {
                    item: item,
                    drawn: false,
                });
            }
            const val = this.uuidMap.get(uuid)!;
            val.item.draw(state, center);
            val.drawn = true;
        }

        for (const [uuid, val] of this.uuidMap.entries()) {
            if (!val.drawn) {
                this.displayObject.removeChild(val.item.displayObject);
                this.uuidMap.delete(uuid);
            } else {
                val.drawn = false;
            }
        }
        return true;
    }
}
