//import { PNG } from "pngjs";

import { DefaultAnimation } from "novadatainterface/Animation";

//import { Resource } from "resourceforkjs";
import { DefaultBaseData } from "novadatainterface/BaseData";
//import * as UUID from "uuid/v4";
import UUID from "uuid/v4";
import * as fs from 'fs';


type Test = string;
//const UUID = UUIDs.v4;
export function stuff() {
    //console.log("Hello, world!, " + UUID());
    console.log(UUID());
    //  console.log(PNG);
    console.log(DefaultBaseData);
    // console.log(Resource);
    //    console.log(fs);
    console.log(fs);
    console.log(DefaultAnimation);
}




