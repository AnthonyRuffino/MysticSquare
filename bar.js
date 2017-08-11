var barsAnswer = calcVolume(null, {count: 12, min: 1, max: 8});
var barHeights = barsAnswer.barHeights;


var X_LEFT_PADDING = 200;
var Y_TOP_PADDING = 600;
var BAR_WIDTH = 1;
var SCALE = 50;

PROFESSING.driver.click = function(){
  barsAnswer = calcVolume(null, {count: 12, min: 1, max: 8});
}

PROFESSING.driver.render = function(){

  		this.renderer.ctx.save();
  		var textSize = 35;
  		this.renderer.ctx.font =  (textSize*this.renderer.viewPortScaler) + "pt Calibri";
  		this.renderer.ctx.fillStyle = "white";
  		this.renderer.ctx.fillText("Dippy",0,(textSize*1)*this.renderer.viewPortScaler);
  		this.renderer.ctx.font =  (20*this.renderer.viewPortScaler) + "pt Calibri";
  	
  		this.renderer.ctx.fillText("Bars: "  + barsAnswer.bars.length,0,(textSize*2)*this.renderer.viewPortScaler);
      this.renderer.ctx.fillText("Bars: "  + barsAnswer.barHeights.join(),0,(textSize*3)*this.renderer.viewPortScaler);
      this.renderer.ctx.fillText("Water Volume: "  + barsAnswer.totalWaterHeight,0,(textSize*4)*this.renderer.viewPortScaler);
  //drawText(beginPath, x, y, text, textSize, fillStyle)
      const _this = this;
      var drawBarsAndWater = (bar, i) =>{
        this.renderer.drawRectangle(true,X_LEFT_PADDING + (i*SCALE),Y_TOP_PADDING,SCALE*BAR_WIDTH,-(bar.height*SCALE), "red", "white");
        this.renderer.drawRectangle(true,X_LEFT_PADDING + (i*SCALE),Y_TOP_PADDING-SCALE*bar.height,SCALE*BAR_WIDTH,-(bar.waterHeight*SCALE), "blue");
      };
      
      barsAnswer.bars.forEach(drawBarsAndWater);
  
  		this.renderer.ctx.restore();
  	}
  	
  	PROFESSING.driver.update = function(){
  	}


function calcVolume(barHeights, randomSettings, symbol, aqua) {
  if (randomSettings) {
    barHeights = [];
    var rand = function(minimum, maximum) {
      var randomNumber =
          Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
      return randomNumber;
    };

    for (var r = 0; r < randomSettings.count; r++) {
      var growthMultiplier = 1;
      if (
        randomSettings.grow &&
        Math.random() * 100 <=
        (randomSettings.growChance ? randomSettings.growChance : 66)
      ) {
        growthMultiplier = r / randomSettings.count * randomSettings.grow;
      }
      barHeights.push(
        rand(randomSettings.min, growthMultiplier * randomSettings.max)
      );
    }
  }

  var bars = [];

  var getFirstWallToTheRight = function getFirstWallToTheRight(
  targetHeight,
   bar,
   barsIn,
   currentTallestIndex
  ) {
    if (bar.right === undefined || bar.right === null) {
      if (currentTallestIndex === -1) {
        return null;
      } else if (bar.height >= barsIn[currentTallestIndex].height) {
        currentTallestIndex = bar.i;
      }
      return barsIn[currentTallestIndex];
    } else if (bar.right.height >= targetHeight) {
      return bar.right;
    } else {
      if (currentTallestIndex === -1) {
        currentTallestIndex = bar.right.i;
      } else if (bar.height >= barsIn[currentTallestIndex].height) {
        currentTallestIndex = bar.i;
      }

      return getFirstWallToTheRight(
        targetHeight,
        bar.right,
        barsIn,
        currentTallestIndex
      );
    }
  };

  var pad = function(n, width, z) {
    z = z || "0";
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  };

  barHeights.forEach((barHeight, i) => {
    var bar = { i: i, height: barHeight };

    if (i > 0) {
      bars[i - 1].right = bar;
      bar.left = bars[i - 1];
    }
    bars.push(bar);
  });

  var drawBars = function(barsIn) {
    console.log("__________________________________________________");
    console.log("__________________________________________________");
    console.log("|");
    console.log("|");
    console.log("|");
    barsIn.forEach((bar, i) => {
      var visual = "";

      for (var dot = 0; dot < bar.height; dot++) {
        visual += symbol ? symbol : "-";
      }
      if (bar.waterHeight !== undefined) {
        for (var water = 0; water < bar.waterHeight; water++) {
          visual += aqua ? aqua : ".";
        }
      }
      console.log(
        pad(i + 1, 4) +
        (bar.waterHeight !== undefined
         ? "[" + pad(bar.waterHeight ? bar.waterHeight : 0, 4) + "]"
         : "") +
        "|" +
        visual
      );
    });
    console.log("|");
    console.log("|");
    console.log("|");
    console.log("__________________________________________________");
    console.log("__________________________________________________");
  };

  drawBars(bars);

  var totalWaterHeight = 0;

  var barIndex = 0;
  var loop = true;

  do {
    var bar = bars[barIndex];

    window.console.log("Processing... ", bar.i + "[" + bar.height + "]");
    if (bar.right && bar.waterHeight === undefined) {
      var firstWallToTheRight = getFirstWallToTheRight(
        bar.height,
        bar,
        bars,
        -1
      );
      if (firstWallToTheRight) {
        if (firstWallToTheRight.i > bar.i + 1) {
          bar.waterHeight = 0;
          console.log(
            "found wall to right: ",
            firstWallToTheRight.i,
            firstWallToTheRight.height
          );

          var heightOfCurrentPool = Math.min(
            bar.height,
            firstWallToTheRight.height
          );

          for (var i = bar.i + 1; i < firstWallToTheRight.i; i++) {
            var barToCalc = bars[i];
            barToCalc.waterHeight = heightOfCurrentPool - barToCalc.height;
            totalWaterHeight += barToCalc.waterHeight;
          }

          barIndex = firstWallToTheRight.i - 1;
        } else {
          bar.waterHeight = 0;
          console.log("bar to immediate right was bigger or equal");
        }
      } else {
        bar.waterHeight = 0;
        console.log("no wall to the right");
      }
    } else if (!bar.right) {
      bar.waterHeight = 0;
    }

    if (barIndex === bars.length - 1) {
      loop = false;
    }

    barIndex++;
  } while (loop);

  window.console.log("TOTAL WATER HEIGHT: ", totalWaterHeight);

  drawBars(bars);

  window.console.log("TOTAL WATER HEIGHT: ", totalWaterHeight);
  
  return {bars: bars, totalWaterHeight: totalWaterHeight, barHeights: barHeights};
};
