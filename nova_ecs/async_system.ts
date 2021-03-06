import { zip } from "fp-ts/lib/ReadonlyArray";
import { applyPatches, createDraft, enablePatches, finishDraft, Patch, produceWithPatches } from "immer";
import { ArgData, ArgsToData, ArgTypes, QueryResults, UUID } from "./arg_types";
import { Plugin } from "./plugin";
import { Query } from "./query";
import { Resource } from "./resource";
import { BaseSystemArgs, System } from "./system";
import { currentIfDraft, DefaultMap } from "./utils";

export const AsyncSystemData = new Resource<{
    systems: DefaultMap<string /* system name */,
        DefaultMap<string /* entity uuid */, {
            patches: Patch[][],
            promise: Promise<void>,
        }>>,
    done: Promise<void>,
}>({
    name: 'AsyncSystemData',
    multiplayer: false,
    mutable: true,
});

export interface AsyncSystemArgs<StepArgTypes extends readonly ArgTypes[]>
    extends BaseSystemArgs<StepArgTypes> {
    step: (...args: ArgsToData<StepArgTypes>) =>
        Promise<void | ArgsToData<StepArgTypes>>;
}

enablePatches();

function getCurrentArgs<A extends readonly ArgTypes[]>(args: A,
    argsData: ArgsToData<A>): [...ArgsToData<A>] {
    return zip(args, argsData).map(([arg, argData]) => {
        if (arg instanceof Query) {
            const queryResults = argData as QueryResults<Query>;
            const res = queryResults.map(queryArgsData =>
                getCurrentArgs(arg.args, queryArgsData));
            return res;
        } else {
            return currentIfDraft(argData) as ArgData<A>;
        }
    }) as [...ArgsToData<A>]
}

export class AsyncSystem<StepArgTypes extends readonly ArgTypes[] = readonly ArgTypes[]>
    extends System<[typeof AsyncSystemData, typeof UUID, ...StepArgTypes]> {
    constructor(systemArgs: AsyncSystemArgs<StepArgTypes>) {
        super({
            ...systemArgs,
            args: [AsyncSystemData, UUID, ...systemArgs.args],
            step: (asyncSystemData, UUID, ...stepArgs) => {
                const system = asyncSystemData.systems.get(this.name);
                const entityStatus = system?.get(UUID);
                if (!entityStatus) {
                    throw new Error("Expected default map to provide entity status");
                }

                // Apply patches from the previous complete run.
                // Note that this only runs if the entity still exists.

                // This is a hack to force immer to treat stepArgs
                // as if it were a draft. It greatly simplifies the rest
                // of the code, but may break in the future.
                (stepArgs as any)[Symbol.for('immer-state')] = true;
                for (const patches of entityStatus.patches) {
                    applyPatches(stepArgs, patches);
                }
                entityStatus.patches = [];

                const currentArgs = getCurrentArgs(systemArgs.args, stepArgs);
                const draftArgs = createDraft(currentArgs);

                // TODO: This error handling is wrong.
                entityStatus.promise = systemArgs.step(...draftArgs as typeof stepArgs)
                    .then(() => {
                        let patches: Patch[] | undefined;
                        if (currentArgs) { }
                        finishDraft(draftArgs, (forwardPatches) => {
                            patches = forwardPatches;
                        });

                        if (!patches) {
                            throw new Error('Got no patches when calling async system');
                        }
                        if (patches.length > 0) {
                            entityStatus.patches.push(patches);
                        }
                    });

                asyncSystemData.done = (async () => {
                    await asyncSystemData.done;
                    await entityStatus.promise;
                })();
            }
        });
    }
}

export const AsyncSystemPlugin: Plugin = {
    name: 'AsyncSystem',
    build: (world) => {
        world.addResource(AsyncSystemData, {
            done: Promise.resolve(),
            systems: new DefaultMap<string /* system name */,
                DefaultMap<string /* entity uuid */, {
                    patches: Patch[][],
                    promise: Promise<void>,
                }>>(
                    () => new DefaultMap(() => {
                        return {
                            patches: [],
                            promise: Promise.resolve(),
                        }
                    })
                )
        });
    }
};
