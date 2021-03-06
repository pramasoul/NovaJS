import * as PIXI from "pixi.js";
import * as path from "path";
import { GameDataInterface } from "novajs/novadatainterface/GameDataInterface";
import { NovaDataInterface, NovaDataType } from "novajs/novadatainterface/NovaDataInterface";
import { NovaIDs } from "novajs/novadatainterface/NovaIDs";
import { BaseData } from "novajs/novadatainterface/BaseData";
import { PictImageData } from "novajs/novadatainterface/PictImage";
import { SpriteSheetImageData, SpriteSheetFramesData, SpriteSheetData } from "novajs/novadatainterface/SpriteSheetData";
import { ExplosionData } from "novajs/novadatainterface/ExplosionData";
import { StatusBarData } from "novajs/novadatainterface/StatusBarData";
import { TargetCornersData } from "novajs/novadatainterface/TargetCornersData";
import { SystemData } from "novajs/novadatainterface/SystemData";
import { PlanetData } from "novajs/novadatainterface/PlanetData";
import { PictData } from "novajs/novadatainterface/PictData";
import { WeaponData } from "novajs/novadatainterface/WeaponData";
import { OutfitData } from "novajs/novadatainterface/OutiftData";
import { ShipData } from "novajs/novadatainterface/ShipData";
import { Gettable } from "novajs/novadatainterface/Gettable";
import { dataPath, idsPath } from "../../common/GameDataPaths";

/**
 * Retrieves game data from the server
 */
class GameData implements GameDataInterface {
    public readonly data: NovaDataInterface;
    public readonly ids: Promise<NovaIDs>;

    constructor() {
        // There should be a better way to do this. I'm repeating myself here.
        this.data = {
            Ship: this.addGettable<ShipData>(NovaDataType.Ship),
            Outfit: this.addGettable<OutfitData>(NovaDataType.Outfit),
            Weapon: this.addGettable<WeaponData>(NovaDataType.Weapon),
            Pict: this.addGettable<PictData>(NovaDataType.Pict),
            PictImage: this.addPictGettable<PictImageData>(NovaDataType.PictImage),
            Planet: this.addGettable<PlanetData>(NovaDataType.Planet),
            System: this.addGettable<SystemData>(NovaDataType.System),
            TargetCorners: this.addGettable<TargetCornersData>(NovaDataType.TargetCorners),
            SpriteSheet: this.addGettable<SpriteSheetData>(NovaDataType.SpriteSheet),
            SpriteSheetImage: this.addPictGettable<SpriteSheetImageData>(NovaDataType.SpriteSheetImage),
            SpriteSheetFrames: this.addGettable<SpriteSheetFramesData>(NovaDataType.SpriteSheetFrames),
            StatusBar: this.addGettable<StatusBarData>(NovaDataType.StatusBar),
            Explosion: this.addGettable<ExplosionData>(NovaDataType.Explosion)
        };

        this.ids = this.getIds();

    }

    getSettings(file: string): Promise<unknown> {
        return this.getUrl(path.join("/settings", file));
    }

    private async getUrl(url: string): Promise<Buffer> {
        return await new Promise(function(fulfill, reject) {
            //var loader = new PIXI.loaders.Loader();
            var loader = new PIXI.Loader();
            loader.add(url, url)
                .load(function(_loader: any, resources: Partial<Record<string, PIXI.LoaderResource>>) {
                    const resource = resources[url];
                    if (resource == undefined) {
                        reject(`Resource ${url} not present on loaded url`)
                        return;
                    }
                    if (resource.error) {
                        reject(resource.error);
                    }
                    else {
                        fulfill(resource.data);
                    }
                });
        });

    }

    private getDataPrefix(dataType: NovaDataType): string {
        return path.join(dataPath, dataType);
    }

    private addGettable<T extends BaseData | SpriteSheetFramesData>(dataType: NovaDataType): Gettable<T> {
        var dataPrefix = this.getDataPrefix(dataType);
        return new Gettable<T>(async (id: string): Promise<T> => {
            return (await this.getUrl(path.join(dataPrefix, id + ".json"))) as any;
        });
    }

    private addPictGettable<T extends PictImageData | SpriteSheetImageData>(dataType: NovaDataType): Gettable<T> {
        var dataPrefix = this.getDataPrefix(dataType);
        return new Gettable<T>(async (id: string): Promise<T> => {
            return <T>(await this.getUrl(path.join(dataPrefix, id) + ".png"));
        });
    }

    async textureFromPict(id: string): Promise<PIXI.Texture> {
        const pictPath = path.join(dataPath, NovaDataType.PictImage, id + ".png");
        // if (!PIXI.utils.TextureCache[pictPath]) {
        //     await this.getUrl(pictPath);
        // }

        await this.data.PictImage.get(id);
        return PIXI.Texture.from(pictPath);
    }


    async spriteFromPict(id: string) {
        // TODO: Use this.data
        var texture = await this.textureFromPict(id);
        return new PIXI.Sprite(texture);
    }

    private async getIds(): Promise<NovaIDs> {
        return ((await this.getUrl(idsPath + ".json")) as unknown) as NovaIDs;
        //return JSON.parse(idsBuffer.toString('utf8'));
    }
}

export { GameData }
