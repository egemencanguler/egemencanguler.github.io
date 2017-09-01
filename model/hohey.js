var hohey = {}
hohey.train = false;



    var resizeWidth = 10;
    var resizeHeight = 6;
    
    /**
     * Compute eyes size as gray histogram
     * @param {Object} eyes - The eyes where looking for gray histogram
     * @returns {Array.<T>} The eyes gray level histogram
     */
    function getEyeFeats(eyes) {
        var resizedLeft = webgazer.util.resizeEye(eyes.left, resizeWidth, resizeHeight);
        var resizedright = webgazer.util.resizeEye(eyes.right, resizeWidth, resizeHeight);

        var leftGray = webgazer.util.grayscale(resizedLeft.data, resizedLeft.width, resizedLeft.height);
        var rightGray = webgazer.util.grayscale(resizedright.data, resizedright.width, resizedright.height);

        var histLeft = [];
        webgazer.util.equalizeHistogram(leftGray, 5, histLeft);
        var histRight = [];
        webgazer.util.equalizeHistogram(rightGray, 5, histRight);

        var leftGrayArray = Array.prototype.slice.call(histLeft);
        var rightGrayArray = Array.prototype.slice.call(histRight);

        return leftGrayArray.concat(rightGrayArray);
    }

    function getRandom(arr, n) 
    {
	    var result = new Array(n),
	        len = arr.length,
	        taken = new Array(len);
	    if (n > len)
	        throw new RangeError("getRandom: more elements taken than available");
	    while (n--) {
	        var x = Math.floor(Math.random() * len);
	        result[n] = arr[x in taken ? taken[x] : x];
	        taken[x] = --len;
	    }
	    return result;
	}
    /**
     * Constructor of HoheyReg object,
     * this object allow to perform ridge regression
     * @constructor
     */
    hohey.model = function() 
    {
        hohey.data = [];
        hohey.labels = [];
        hohey.layer_defs = [];

        hohey.layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:120});
        hohey.layer_defs.push({type:'fc', num_neurons:10, activation:'relu'});
        //model.layer_defs.push({type:'fc', num_neurons:20, activation:'sigmoid'});
        hohey.layer_defs.push({type:'regression', num_neurons:2});

        hohey.net = new convnetjs.Net();
        hohey.net.makeLayers(hohey.layer_defs);

        //trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.01, momentum:0.0, batch_size:1, l2_decay:0.001});
        hohey.trainer = new convnetjs.Trainer(hohey.net, {method: 'adadelta', l2_decay: 0.001, batch_size: 10});
        //model.trainerX = new convnetjs.SGDTrainer(model.netX, {learning_rate:0.01, momentum:0.0, batch_size:1, l2_decay:0.001});

        var update = function()
        {
        	if(hohey.train)
        	{
        		var data = hohey.data;
	        	var labels = hohey.labels;
	        	var trainer = hohey.trainer;
	        	
	        	console.log(data.length);
	            if(data != null && data.length > 1)
	            {
	                var N = data.length;
	                var netx = new convnetjs.Vol(1,1,120);
	                var avloss = 0.0;
	                for(var iters = 0; iters < 50; iters++) 
	                {
	                    for(var ix = 0;ix < N; ix++)
	                    {
	                      netx.w = data[ix];
	                      var stats = trainer.train(netx, labels[ix]);
	                      avloss += stats.loss;
	                    }
	                }
	                avloss /= N * iters * 2;
	                console.log("AvgLoss" + avloss);
	            };
        	}
        	
            setTimeout(update, 30);
        }
        update();
    };

    /**
     * Add given data from eyes
     * @param {Object} eyes - eyes where extract data to add
     * @param {Object} screenPos - The current screen point
     * @param {Object} type - The type of performed action
     */
    hohey.model.prototype.addData = function(eyes, screenPos, type) 
    {
        if (!eyes) {
            return;
        }
        if (eyes.left.blink || eyes.right.blink) {
            return;
        }
        if (type === 'click') 
        {
            console.log("Data");
            hohey.data.push(getEyeFeats(eyes));
            hohey.labels.push([screenPos[0],screenPos[1]]);
        } 

    }

    hohey.model.prototype.update = function() 
    {

    }

    /**
     * Try to predict coordinates from pupil data
     * after apply linear regression on data set
     * @param {Object} eyesObj - The current user eyes object
     * @returns {Object}
     */
    hohey.model.prototype.predict = function(eyesObj) 
    {
        if (!eyesObj || hohey.data.length === 0) {
            return null;
        }

        var f = new convnetjs.Vol(getEyeFeats(eyesObj));
        var pred = hohey.net.forward(f);

        var predictedX = Math.floor(pred.w[0]);
        var predictedY = Math.floor(pred.w[1]);

        return {
            x: predictedX,
            y: predictedY
        };
    };

    /**
     * Add given data to current data set then,
     * replace current data member with given data
     * @param {Array.<Object>} data - The data to set
     */
    hohey.model.prototype.setData = function(data) 
    {
        return;
        for (var i = 0; i < data.length; i++) {
            //TODO this is a kludge, needs to be fixed
            data[i].eyes.left.patch = new ImageData(new Uint8ClampedArray(data[i].eyes.left.patch), data[i].eyes.left.width, data[i].eyes.left.height);
            data[i].eyes.right.patch = new ImageData(new Uint8ClampedArray(data[i].eyes.right.patch), data[i].eyes.right.width, data[i].eyes.right.height);
            hohey.addData(data[i].eyes, data[i].screenPos, data[i].type);
        }
    };

    /**
     * Return the data
     * @returns {Array.<Object>|*}
     */
    hohey.model.prototype.getData = function() 
    {
        return hohey.data;
    }
    
    
