
var experiment = {}
experiment.started = false;
experiment.currentRecording = null;
experiment.imageLoaded = false; // start recording data when image is loaded
experiment.data = null;
experiment.recordingQ = null;
experiment.windowSize = null;

// show each image for spesified duration
//var DURATION = 3000;
var DURATION = 3000;

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
  var img = document.createElement("img");
  img.id = "image";
  document.body.appendChild(img);

  numberOfImages = 5;
  var number = 0;
  startRecording(number ++);
  /* ! */

  var refreshIntervalId = setInterval(
    function()
    {
      if(number == numberOfImages)
      {
          clearInterval(refreshIntervalId);
          endExperiment();
      }else
      {
        startRecording(number ++);
      }
    }, DURATION);

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
  var imagePath = "./imgs/img" + String(imageNumber) + ".jpg";
  experiment.imageLoaded = false;
  experiment.currentRecording =
  {
    imageSize : null,
    imageScaledSize : null,
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
  changeImage(imagePath);

}
function changeImage(path)
{
    var img = document.getElementById("image");
    img.src = path
    img.onload = function()
    {
        experiment.currentRecording.imageSize = [img.naturalWidth,img.naturalHeight];
        var windowSize = experiment.windowSize;
        var imgRatio = img.naturalWidth / img.naturalHeight;
        var windowRatio = windowSize.width / windowSize.height;
        if(imgRatio > windowRatio)
        {
          img.width = windowSize.width;
          img.height = img.width * (img.naturalHeight / img.naturalWidth);
        }else
        {
          img.height = windowSize.height;
          img.width = img.height * (img.naturalWidth / img.naturalHeight);
        }
        experiment.currentRecording.imageScaledSize = [img.width,img.height];
        experiment.imageLoaded = true;
    }
}

function onGazeData(data,elapsedTime)
{
    if (data == null || !experiment.imageLoaded)
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

    instructions.show(instructions.insExperimentEnd);
    console.log(experiment.data);
    experiment.currentRecording = null;
    imageLoaded = false;
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


