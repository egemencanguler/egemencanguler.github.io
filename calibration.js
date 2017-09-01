
      var calibration = {}
      var CALIBRATION_TIMEOUT = 3000;
      calibration.timeout = null;

      calibration.addData = function(feature,posX,posY)
      {
      		calibration.data.push([feature,[posX,posY]]);
      }

      // Train Target parameters
      var TrTInnerRadius = 7;
      var TrTOutherRadius = 25;
      var TrTInnerColor = "red";
      var TrTInnerHoverColor = "green";
      var TrTOutherColor = "green";

      // Test Target parameters
      var TeTInnerRadius = 50;
      var TeTOutherRadius = 52;
      var TeTInnerColor = "red";
      var TeTInnerHoverColor = "green";
      var TeTOutherColor = "green";
      var TeTHealth = 10;

      function StartCalibration(onCalibrationEnd, onCalibrationTimeout)
      {
        hohey.train = true;
        var canvas = document.getElementById('mainCanvas');
        var context = canvas.getContext('2d');
        
        context.canvas.width=window.innerWidth;
        context.canvas.height=window.innerHeight;

        calibration.canvas = canvas;
        calibration.context = context;
        calibration.width = window.innerWidth;
        calibration.height = window.innerHeight;

        calibration.data = [];

        calibration.calibrationEnd = onCalibrationEnd;
        calibration.calibrationTimeout = onCalibrationTimeout;
        
        var margin = TrTOutherRadius + 5;
        calibration.targetPositions = [];
        var rowNumber = 4;
        var columnNumber = 5;
        var xMarginBetween = (calibration.width - 2 * margin) / (columnNumber - 1);
        var yMarginBetween = (calibration.height - 2 * margin) / (rowNumber - 1);
        
        for(var i = 0; i < 2; i ++)
        {
          for(var x = 0; x < columnNumber; x ++)
          {
            var posX = xMarginBetween * x + margin;
            for(var y = 0; y < rowNumber; y ++)
            {
              var posY = yMarginBetween * y + margin;
              calibration.targetPositions.push([posX,posY]);
            }
          }

        }


        calibration.lastTargetPosIdx = -1;
        NextTarget();

        var drawLoop = setInterval(function() 
        {
           calibrationDraw();
        }, 20);

        document.addEventListener('mousemove', onCalibrationMouseMove, true);
        document.addEventListener('click', onCallibrationMouseClick, true);

		    calibration.endCalibration = function()
		    {
  		    document.removeEventListener('mousemove', onCalibrationMouseMove, true);
          document.removeEventListener('click', onCallibrationMouseClick, true);
  		    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          clearInterval(drawLoop);
          checkCalibration();
		    }
      }

      function NextTarget() 
      {
      	calibration.lastTargetPosIdx += 1;
      	if(calibration.lastTargetPosIdx >= calibration.targetPositions.length)
      	{
      		return false;
      	}
        tPos = calibration.targetPositions[calibration.lastTargetPosIdx];
        calibration.target = {
          x:tPos[0],
          y:tPos[1],
          radius : TrTInnerRadius,
          sqr_radius: TrTInnerRadius * TrTInnerRadius,
          strokeWidth: TrTOutherRadius - TrTInnerRadius,
          draw:function(context) 
          {
              context.beginPath();
              context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
              context.fillStyle = TrTInnerColor;
              if(this.hover)
              {
                context.fillStyle = TrTInnerHoverColor;
              }
              context.fill();
              context.lineWidth = this.strokeWidth;
              context.strokeStyle = '#003300';
              context.stroke();

          },
          contains:function(posX,posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return dis2 < this.sqr_radius; 
          },
          outherContains:function(posX,posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return dis2 < TrTOutherRadius* TrTOutherRadius;
          },
          hover:false
        }

        return true;
      }
      
      function calibrationDraw()
      {
        
        context = calibration.context;
        canvas = calibration.canvas;

        // Clean the canvas
        context.clearRect(0, 0, calibration.canvas.width, canvas.height);
        calibration.target.draw(context);

        var prediction = webgazer.getCurrentPrediction();
        if(prediction != null)
        {
        	context.fillStyle = 'green';
        	context.fillRect(prediction.x,prediction.y,5,5);
        }

      }

      function onCalibrationMouseMove(evt)
      {
        var target = calibration.target;
        var mx = event.clientX;
        var my = event.clientY;
        if(target.outherContains(mx,my))
        {
          var features = webgazer.addData(target.x,target.y,"click");
          calibration.addData(features,target.x,target.y);
        }
        if(calibration.target.contains(mx,my))
        {
          calibration.target.hover = true;
        }else
        {
          calibration.target.hover = false;
        }
      }

      function onCallibrationMouseClick(evt)
      {
        var target = calibration.target;
        var mx = event.clientX;
        var my = event.clientY;
        if(target.contains(mx,my))
        {
            var features = webgazer.addData(target.x,target.y,"click");
            calibration.addData(features,target.x,target.y);
            if(!NextTarget())
            {
            	console.log("End Calibration!");
              setTimeout(calibration.endCalibration(),5000);
            	//calibration.endCalibration();
            }
        }

      }

      function write(txt,posX,posY)
      {
        posX -= 100;
        posY -= 100;
        calibration.context.font = "30px Arial";
        calibration.context.fillText(txt,posX,posY);
      }

      // Calibration check

      function NextCheckTarget() 
      {
        calibration.lastTargetPosIdx += 1;
        if(calibration.lastTargetPosIdx >= calibration.targetPositions.length)
        {
          return false;
        }

        tPos = calibration.targetPositions[calibration.lastTargetPosIdx];
        calibration.target = {
          x:tPos[0],
          y:tPos[1],
          radius:TeTInnerRadius,
          sqr_radius: TeTInnerRadius * TeTInnerRadius,
          strokeWidth: TeTOutherRadius - TeTInnerRadius,
          health: TeTHealth,
          draw:function(context) 
          {
              context.beginPath();
              context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
              context.fillStyle = TeTInnerColor;
              if(this.hover)
              {
                context.fillStyle = TeTInnerHoverColor;
              }
              context.fill();
              context.lineWidth = this.strokeWidth;
              context.strokeStyle = TrTOutherColor;
              context.stroke();

          },
          contain:function(posX,posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return dis2 < this.sqr_radius; 
          },
          distance:function(posX, posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return Math.sqrt(dis2);

          },
          hover:false
        }

        if(calibration.timeout != null)
        {
          clearTimeout(calibration.timeout);
        }
        calibration.timeout = setTimeout(calibrationCheckTimeout,CALIBRATION_TIMEOUT);

        return true;
      }



      function checkCalibration()
      {
        hohey.train = false;
      	
        var w = calibration.width;
        var h = calibration.height;
        var margin = TeTOutherRadius + 10;
        calibration.targetPositions = [ [margin,margin], [w-margin,margin], [w-margin,h-margin],[margin,h-margin],[w/2,h/2]];
        calibration.lastTargetPosIdx = -1;
        NextCheckTarget();

        var drawLoop = setInterval(function() 
        {
           checkDraw();
        }, 20);

        calibration.endCheck = function()
        {
            clearInterval(drawLoop);
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
      }

      function checkDraw()
      {

        context = calibration.context;
        canvas = calibration.canvas;
        // Clean the canvas
        context.clearRect(0, 0, calibration.canvas.width, canvas.height);
        calibration.target.draw(context);

        var prediction = webgazer.getCurrentPrediction();
        if(prediction != null)
        {
            if(calibration.target.contain(prediction.x,prediction.y))
            {
               calibration.target.hover = true;
               calibration.target.health -= 1;
               if(calibration.target.health <= 0)
               {
                  if(!NextCheckTarget())
                  {
                    console.log("End Check!");
                    clearTimeout(calibration.timeout);
                    calibration.endCheck();
                    calibration.calibrationEnd();
                  }
               }
            }else
            {
               calibration.target.hover = false;
            }
        }

      }

      function calibrationCheckTimeout()
      {
          console.log("Time Out!");
          calibration.endCheck();
          calibration.calibrationTimeout();
      }










