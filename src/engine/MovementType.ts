import * as t from "io-ts";

const MovementType = t.union([
    t.literal("inertial"),
    t.literal("inertialess")
]);

type MovementType = t.TypeOf<typeof MovementType>;

export { MovementType }
