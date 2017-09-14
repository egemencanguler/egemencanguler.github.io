
var experiment = {}
experiment.started = false;
experiment.currentRecording = null;
experiment.imageLoaded = false; // start recording data when image is loaded
experiment.data = null;
experiment.recordingQ = null;
experiment.windowSize = getWindowSize();





// show each image for spesified duration
var DURATION = 3000;
experiment.images = [];

for(var i = 0; i < 5; i ++)
{
  var video = document.createElement("video");
  video.class = "videos";
  video.id = "video" + i;
  video.src = "videos/video" + i + ".mp4";
  video.style.display = 'none';
  experiment.images.push(video);

  video.onloadedmetadata = function(evt)
  {
      this.naturalWidth = this.videoWidth;
      this.naturalHeight = this.videoHeight;

      var windowSize = experiment.windowSize;
      var videoRatio = this.videoWidth / this.videoHeight;
      var windowRatio = windowSize.width / windowSize.height;

      if(videoRatio > windowRatio)
      {
        this.width = windowSize.width;
        this.height = this.width * (this.naturalHeight / this.naturalWidth );
      }else
      {
        this.height = windowSize.height;
        this.width = this.height * (this.naturalWidth  / this.naturalHeight);
      }
      this.scaledSize = [this.width,this.height];
      this.imageSize = [this.naturalWidth,this.naturalHeight];
      console.log(this.naturalWidth + "," + this.naturalHeight);
      this.style.position = 'absolute';
      this.style.top = window.innerHeight / 2 - this.height /2;
      this.style.left = window.innerWidth / 2 - this.width/2;
  };

  video.hide = function()
  {
      this.style.display = 'none';
      this.pause();
  }
  video.show = function()
  {
      this.style.display = 'block';
      this.play();
  }
  document.body.appendChild(video);
}

function getWindowSize()
{
  /*var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;*/
  var x = window.innerWidth;
  var y = window.innerHeight;
  var size = {width:x,height:y,x:x,y:y};
  return size;
}

function startExperiment()
{
  instructions.show(instructions.experiment);
  setTimeout(function(){ experiment.start(); }, 3000);
}

experiment.start = function()
{
  instructions.hide(instructions.experiment);

  webgazer.setGazeListener(onGazeData);

  experiment.started = true;
  experiment.windowSize = getWindowSize();
  experiment.recordingQ = [];
  experiment.data = {
    "windowSize" : experiment.windowSize,
    "recordings" : experiment.recordingQ
  };

  // Create Image Container
  numberOfImages = 5;
  var number = 0;

  var refresh = function()
  {
      console.log("Refresh");
      if(number == numberOfImages){endExperiment(); return;}
      var duration = startRecording(number ++) * 1000;
      // convert second to miliseconds
      console.log("Wait" + duration);
      setTimeout(function(){refresh();}, duration);
  }
  refresh();
  if(DEBUG)
  {
    debugDraw();
  }

  var canvas = document.getElementById('mainCanvas');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

}


function startRecording(imageNumber)
{
  var img = experiment.images[imageNumber];

  experiment.currentRecording =
  {
    imageSize : [img.naturalWidth,img.naturalHeight],
    imageScaledSize : img.scaledSize,
    imageNumber : imageNumber,
    gazeData : [],
    addGazeData : function(x,y,elapsedTime)
    {
        var windowSize = experiment.windowSize;
        var leftX = (windowSize.width - this.imageScaledSize[0]) / 2;
        var upY = (windowSize.height - this.imageScaledSize[1]) / 2;

        var normalizedX = (x - leftX)/this.imageScaledSize[0];
        var normalizedY = (y - upY)/this.imageScaledSize[1];
        experiment.currentRecording.gazeData.push([normalizedX,normalizedY,x,y,elapsedTime,webgazer.getEyeFeatureVec()]);
    }
  };
  experiment.recordingQ.push(experiment.currentRecording);
  var oldImgIndex = imageNumber - 1;
  if(oldImgIndex >= 0)
  {
    experiment.images[oldImgIndex].hide();
  }
  img.show();
  return img.duration;
}

function onGazeData(data,elapsedTime)
{
    if (data == null)
    {
        return;
    }
    var xprediction = data.x; //these x coordinates are relative to the viewport
    var yprediction = data.y; //these y coordinates are relative to the viewport
    if(experiment.currentRecording != null)
    {
        experiment.currentRecording.addGazeData(data.x,data.y,elapsedTime);
    }
}

function endExperiment()
{
    experiment.images[4].hide();
    webgazer.clearGazeListener();
    instructions.show(instructions.insExperimentEnd);
    console.log(experiment.data);
    experiment.currentRecording = null;
    data.save();
}


function debugDraw()
{
  var canvas = document.getElementById('mainCanvas');
  var context = canvas.getContext('2d');

  var refreshIntervalId = setInterval(
    function()
    {
        
      context.clearRect(0, 0, canvas.width, canvas.height);
      if(experiment.currentRecording != null)
      {
        for(var i = 0; i < experiment.currentRecording.gazeData.length; i ++)
        {
          var point = experiment.currentRecording.gazeData[i];
          context.beginPath();
          context.arc(point[2], point[3], 10, 0, 2 * Math.PI, false);
          context.fillStyle = "green";
          context.fill();
        }
      }
      

    }, 30);
  
}


