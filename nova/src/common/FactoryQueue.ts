import { Queue, QueueImpl } from "./Queue";

export class FactoryQueue<Item> implements Queue<Item> {
    buildingPromise: Promise<unknown>;
    private queue = new QueueImpl<Item>();

    constructor(private readonly buildFunction: () => Promise<Item> | Item, public minimum = 0) {
        this.buildingPromise = this.buildToCountNoCheck(minimum);
    }

    private async prebuild(c: number) {
        let promises: Array<Promise<Item> | Item> = Array(c);
        for (let i = 0; i < c; i++) {
            promises[i] = this.buildFunction();
        }

        let items = await Promise.all(promises);
        for (let item of items) {
            this.queue.enqueue(item);
        }
    }

    private async buildToCountNoCheck(c: number) {
        let deficit = c - this.queue.count;
        if (deficit > 0) {
            await this.prebuild(deficit);
        }
    }

    buildToCount(c: number): Promise<unknown> {
        this.buildingPromise =
            this.buildingPromise.then(() => {
                return this.buildToCountNoCheck(c)
            });
        return this.buildingPromise;
    }

    get count() {
        return this.queue.count;
    }

    enqueue(i: Item) {
        this.queue.enqueue(i);
    }

    dequeue(): Item | null {
        let maybeItem = this.queue.dequeue();

        // If the queue is empty, try to synchronously build a new item.
        if (maybeItem === null) {
            const builtItem = this.buildFunction();

            // Can't return a promise, so stick it in the queue when it's built.
            if (builtItem instanceof Promise) {
                this.buildingPromise = this.buildingPromise.then(async () => {
                    this.queue.enqueue(await builtItem);
                });
            } else {
                maybeItem = builtItem;
            }
        }
        this.buildToCount(this.minimum);
        return maybeItem;
    }

    // A strange thing to do to a factoryqueue.
    emptyTo(f: (i: Item) => void) {
        this.queue.emptyTo(f);
    }

    async dequeueGuaranteed(): Promise<Item> {
        const maybeItem = this.dequeue();
        if (maybeItem) {
            return maybeItem;
        } else {
            // Return the next available item,
            // which may already be getting built.
            await this.buildToCount(1);
            return await this.dequeueGuaranteed();
        }
    }
}
