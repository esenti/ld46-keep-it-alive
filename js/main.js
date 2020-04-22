(function() {
  var DEBUG, before, c, ctx, delta, draw, elapsed, keysDown, keysPressed, load, loading, now, ogre, setDelta, tick, update;

  c = document.getElementById('draw');
  ctx = c.getContext('2d');

  delta = 0;
  now = 0;
  before = Date.now();
  elapsed = 0;
  loading = 0;

  DEBUG = false;
  //DEBUG = true;

  c.width = 800;
  c.height = 600;

  keysDown = {};

  keysPressed = {};
  click = {};

  framesThisSecond = 0;
  fpsElapsed = 0;
  fps = 0

  gridWidth = 200;
  gridHeight = 148;
  cellSize = 4;

  grid = [];
  newGrid = [];
  cellAge = [];

  shootInterval = 0.3;
  toShoot = 0;

  stepInterval = 0.01;
  toStep = stepInterval;

  spawnInterval = 5;
  toSpawn = spawnInterval;

  player = Math.floor(gridWidth * 0.5);
  playerRaw = player;

  playerSpeed = 50;

  life = 100;

  window.addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
    return keysPressed[e.keyCode] = true;
  }, false);

  window.addEventListener("keyup", function(e) {
    return delete keysDown[e.keyCode];
  }, false);

  c.addEventListener("click", function(e) {
    click = {
      'x': e.offsetX,
      'y': e.offsetY,
    }

    console.log(click);
  })

  setDelta = function() {
    now = Date.now();
    delta = (now - before) / 1000;
    return before = now;
  };

  if (!DEBUG) {
    console.log = function() {
        return null;
    };
  }

  ogre = false;

  clicked = function(c, x, y, w, h) {
    return c.x >= x && c.x <= x + w && c.y >= y && c.y <= y + h;
  }

  neighbours = function(grid, y, x) {
    count = 0;

    count += typeof grid[y - 1] != 'undefined' && grid[y - 1][x - 1] == 1 ? 1 : 0;
    count += typeof grid[y - 1] != 'undefined' && grid[y - 1][x] == 1 ? 1 : 0;
    count += typeof grid[y - 1] != 'undefined' && grid[y - 1][x + 1] == 1 ? 1 : 0;
    count += typeof grid[y] != 'undefined' && grid[y][x - 1] == 1 ? 1 : 0;
    count += typeof grid[y] != 'undefined' && grid[y][x + 1] == 1 ? 1 : 0;
    count += typeof grid[y + 1] != 'undefined' && grid[y + 1][x - 1] == 1 ? 1 : 0;
    count += typeof grid[y + 1] != 'undefined' && grid[y + 1][x] == 1 ? 1 : 0;
    count += typeof grid[y + 1] != 'undefined' && grid[y + 1][x + 1] == 1 ? 1 : 0;

    return count;
 }

  step = function() {
    for (var i = 0; i < gridHeight; ++i)
    {
      for (var j = 0; j < gridWidth; ++j)
      {
        if (i == 0 || j == 0 || j == gridWidth - 1) {
          newGrid[i][j] = 0;
          continue;
        }

        var n = neighbours(grid, i, j);

        if (grid[i][j] == 1)
        {
          if (n < 2 || n > 3)
          {
            newGrid[i][j] = 0;
          } else
          {
            newGrid[i][j] = 1;
          }
        } else {
          if (n == 3)
          {
            newGrid[i][j] = 1;
          } else {
            newGrid[i][j] = 0;
          }
        }

        if (grid[i][j] == 1 && newGrid[i][j] == 1) {
          ++cellAge[i][j];

          if (cellAge[i][j] > 300) {
            newGrid[i][j] = 0;
            grid[i][j] = 0;
            cellAge[i][j] = 0;
          }
        } else {
          cellAge[i][j] = 0;
        }

        if (newGrid[i][j] == 1 && i == gridHeight - 1) {
          life -= 0.1;
          newGrid[i][j] = 0;
        }
      }
    }

    var oldGrid = grid;
    grid = newGrid;
    newGrid = oldGrid;
 }

  spawn = function(type, y, x) {
    if (type == "MMWS")
    {
      grid[y][x - 1] = 1;
      grid[y][x + 1] = 1;
      grid[y + 1][x + 2] = 1;
      grid[y + 2][x - 2] = 1;
      grid[y + 2][x + 2] = 1;
      grid[y + 3][x + 2] = 1;
      grid[y + 4][x - 1] = 1;
      grid[y + 4][x + 2] = 1;
      grid[y + 5][x] = 1;
      grid[y + 5][x + 1] = 1;
      grid[y + 5][x + 2] = 1;
    } else if (type == "HWSS") {
      grid[y][x - 1] = 1;
      grid[y][x + 1] = 1;
      grid[y + 1][x + 2] = 1;
      grid[y + 2][x - 2] = 1;
      grid[y + 2][x + 2] = 1;
      grid[y + 3][x - 2] = 1;
      grid[y + 3][x + 2] = 1;
      grid[y + 4][x + 2] = 1;
      grid[y + 5][x - 1] = 1;
      grid[y + 5][x + 2] = 1;
      grid[y + 6][x] = 1;
      grid[y + 6][x + 1] = 1;
      grid[y + 6][x + 2] = 1;
    }
  }

  tick = function() {
    setDelta();
    elapsed += delta;
    update(delta);
    draw(delta);
    keysPressed = {};
    click = null;
    if (!ogre) {
        return window.requestAnimationFrame(tick);
    }
  };

  update = function(delta) {
    framesThisSecond += 1;
    fpsElapsed += delta;
    toStep -= delta;
    toShoot -= delta;
    toSpawn -= delta;

    if (toStep <= 0)
    {
      toStep = stepInterval;
      step();
    }

    if (toSpawn <= 0) {
      toSpawn = spawnInterval;
      var x = Math.floor(Math.random() * gridWidth - 3) + 6;
      console.log(x);
      spawn(Math.random() > 0.4 ? "MMWS" : "HWSS", 2, x);
    }

    if(keysDown[65] || keysDown[81] || keysDown[37]) {
      if (player > 2) {
        playerRaw -= delta * playerSpeed;
        player = Math.round(playerRaw);
      }
    } else if(keysDown[68] || keysDown[69] || keysDown[39]) {
      if (player < gridWidth - 2) {
        playerRaw += delta * playerSpeed;
        player = Math.round(playerRaw);
      }
    }

    if((keysDown[87] || keysDown[38] || keysDown[90] || keysDown[188] || keysDown[32]) && toShoot <= 0) {
      console.log("Fire!");
      console.log(player);
      toShoot = shootInterval;

      grid[gridHeight - 6][player - 1] = 1;
      grid[gridHeight - 6][player] = 1;
      grid[gridHeight - 6][player + 1] = 1;
      grid[gridHeight - 5][player - 1] = 1;
      grid[gridHeight - 5][player + 2] = 1;
      grid[gridHeight - 4][player - 1] = 1;
      grid[gridHeight - 3][player - 1] = 1;
      grid[gridHeight - 2][player] = 1;
      grid[gridHeight - 2][player + 2] = 1;
    }

    if (life <= 0) {
    ogre = true;
    }

    if(fpsElapsed >= 1) {
      fps = framesThisSecond / fpsElapsed;
      framesThisSecond = fpsElapsed = 0;
    }
  };

  draw = function(delta) {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, c.width, c.height);

    for (var i = 0; i < gridHeight; ++i)
    {
      for (var j = 0; j < gridWidth; ++j)
      {
        if (grid[i][j] == 1)
        {
          ctx.fillStyle = grid[i][j] == 0 ? "#123456" : "#aaaaaa";
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect((player - 1) * cellSize, gridHeight * cellSize, 3 * cellSize, cellSize);

    ctx.fillStyle = "#888888";
    ctx.fillRect(0, (gridHeight - 1) * cellSize, gridWidth * cellSize, 2);

    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, (gridHeight - 1) * cellSize, gridWidth * cellSize * (life / 100), 2);

    if (ogre) {
      ctx.font = "100px Visitor";
      ctx.fillText('GAME OVER', 130, 320);
    }

    if(DEBUG) {
        ctx.fillStyle = "#888888";
        ctx.font = "20px Visitor";
        ctx.fillText(Math.round(fps), 20, 590);
    }
  };

  (function() {
    var targetTime, vendor, w, _i, _len, _ref;
    w = window;
    _ref = ['ms', 'moz', 'webkit', 'o'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    vendor = _ref[_i];
    if (w.requestAnimationFrame) {
    break;
    }
    w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
    }
    if (!w.requestAnimationFrame) {
    targetTime = 0;
    return w.requestAnimationFrame = function(callback) {
    var currentTime;
    targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
    return w.setTimeout((function() {
            return callback(+(new Date));
            }), targetTime - currentTime);
    };
    }
  })();

  load = function() {
    for (var i = 0; i < gridHeight; ++i)
    {
      grid[i] = [];
      newGrid[i] = [];
      cellAge[i] = [];
      for (var j = 0; j < gridWidth; ++j)
      {
        grid[i][j] = 0;
        newGrid[i][j] = 0;
        cellAge[i][j] = 0;
      }
    }

    ctx.font = "100px Visitor";
    ctx.fillText("", 0, 0);

    if(loading) {
      window.requestAnimationFrame(load);
    } else {
      window.requestAnimationFrame(tick);
    }
  };

  load();

}).call(this);