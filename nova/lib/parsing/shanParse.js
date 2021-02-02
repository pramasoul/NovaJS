
var baseParse = require("./baseParse.js");

class shanParse extends baseParse {
    constructor() {
	super(...arguments);
    }
    
    parse(shan) {
	var out = super.parse(...arguments);
	out.images = {};

	out.exitPoints = shan.exitPoints;
	
	var imageNames = ['baseImage', 'altImage', 'glowImage', 'lightImage', 'weapImage'];
	for (var index in imageNames) {
	    var imageName = imageNames[index];
	    var imageInfo = shan[imageName];
	    
	    if (imageInfo.ID <= 0) { // make sure it actually exists
		continue; //...to the next iteration of the loop
	    }

	    // get the rled from novadata
	    var rled = shan.idSpace['rlëD'][imageInfo.ID];

	    //out.images[imageName] = { id: rled.prefix + ":" + rled.id,
	    out.images[imageName] = { id: rled.globalID,
				       imagePurposes: {} };


	    var imagePurposes = out.images[imageName].imagePurposes;
	    
	    imagePurposes.normal = {
		start: 0,
		length: shan.framesPer
	    };

	    // assign what extra frames are used for (banking, animation etc)
	    switch (shan.flags.extraFramePurpose) {
		
	    case ('banking'):
		imagePurposes.left = {
		    start: shan.framesPer,
		    length: shan.framesPer
		};
		    
		imagePurposes.right = {
		    start: shan.framesPer * 2,
		    length: shan.framesPer
		};
		break;
	    case ('animation'):
		imagePurposes.animation = {
		    start: shan.framesPer,
		    // the rest of the frames are for animation
		    length: shan.framesPer * ( (shan[imageName].setCount || shan.baseImage.setCount) - 1 )
		};
		break;
	    }
	}
	return out;
    }
};

module.exports = shanParse;
