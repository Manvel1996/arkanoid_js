const canvas = document.querySelector(".game-board");
const context = canvas.getContext("2d");

const score = document.querySelector(".game__score-count");
const fail = document.querySelector(".game__fail-count");
const restartBtn = document.querySelector(".game__restart");

const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const modalText = document.querySelector(".modal__text");

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

const data = {
  wall: {
    size: 2,
  },

  bricks: [],

  brick: {
    x: 0,
    y: 0,
    height: 20,
    width: 30,
  },

  ball: {
    x: canvas.width / 2 - 40 - 5,
    y: canvas.height - 10 - 10,
    size: 10,
    speed: -5,
    xDelta: 0,
    yDelta: 0,
  },

  paddle: {
    x: canvas.width / 2 - 40,
    y: canvas.height - 10,
    width: 80,
    height: 10,
    xDelta: 0,
  },
};

function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.size > obj2.y
  );
}

function startGame() {
  function randomColor() {
    let myRed = Math.floor(Math.random() * 256);
    let myGreen = Math.floor(Math.random() * 256);
    let myBlue = Math.floor(Math.random() * 256);
    return `rgb(${myRed}, ${myGreen}, ${myBlue})`;
  }

  data.brick.x = Math.ceil(Math.random() * 8);
  if (data.brick.x < 3) data.brick.x = 3;

  for (let row = 0; row < data.brick.x; row++) {
    data.brick.y = Math.ceil(Math.random() * 8);
    if (data.brick.y < 3) data.brick.y = 3;

    data.brick.width = (canvas.width - data.wall.size * 2) / data.brick.y;

    for (let col = 0; col < data.brick.y; col++) {
      const colorCode = randomColor();

      data.bricks.push({
        x: data.wall.size + data.brick.width * col,
        y: data.wall.size + data.brick.height * row,
        color: colorCode,
        width: data.brick.width,
        height: data.brick.height,
      });
    }
  }
}

function update() {
  data.paddle.x += data.paddle.xDelta;
  if (data.paddle.x < data.wall.size) {
    data.paddle.x = data.wall.size;
  } else if (
    data.paddle.x + data.paddle.width >
    canvas.width - data.wall.size
  ) {
    data.paddle.x = canvas.width - data.wall.size - data.paddle.width;
  }

  data.ball.x += data.ball.xDelta;
  data.ball.y += data.ball.yDelta;

  if (data.ball.x < data.wall.size) {
    data.ball.x = data.wall.size;
    data.ball.xDelta *= -1;
  } else if (data.ball.x + data.ball.size > canvas.width - data.wall.size) {
    data.ball.x = canvas.width - data.wall.size - data.ball.size;
    data.ball.xDelta *= -1;
  }

  if (data.ball.y < data.wall.size) {
    data.ball.y = data.wall.size;
    data.ball.yDelta *= -1;
  }

  if (data.ball.y > canvas.height) {
    fail.textContent = +fail.textContent + 1;

    data.ball.x = data.paddle.x + data.paddle.width / 2 - data.ball.size / 2;
    data.ball.y = canvas.height - data.paddle.height - data.ball.size;
    data.ball.xDelta = 0;
    data.ball.yDelta = 0;
  } else if (data.ball.xDelta === 0 && data.ball.yDelta === 0) {
    data.ball.x = data.paddle.x + data.paddle.width / 2 - data.ball.size / 2;
    data.ball.y = canvas.height - data.paddle.height - data.ball.size;
  }

  if (collides(data.ball, data.paddle)) {
    if (data.ball.y + data.ball.size + data.ball.speed <= data.paddle.y) {
      data.ball.yDelta *= -1;
      data.ball.y = data.paddle.y - data.ball.size;
    } else {
      data.ball.xDelta *= -1;
    }
  }
}

function drow() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < data.bricks.length; i++) {
    const brick = data.bricks[i];

    if (collides(data.ball, brick)) {
      score.textContent = +score.textContent + 1;
      data.bricks.splice(i, 1);
      if (
        data.ball.y + data.ball.size + data.ball.speed <= brick.y ||
        data.ball.y >= brick.y + brick.height + data.ball.speed
      ) {
        data.ball.yDelta *= -1;
      } else {
        data.ball.xDelta *= -1;
      }
      break;
    }
  }

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, data.wall.size);
  context.fillRect(0, 0, data.wall.size, canvas.height);
  context.fillRect(
    canvas.width - data.wall.size,
    0,
    data.wall.size,
    canvas.height
  );

  context.fillStyle = "red";
  context.beginPath();
  context.roundRect(data.ball.x, data.ball.y, data.ball.size, data.ball.size, [
    40,
  ]);
  context.fill();

  data.bricks.forEach((brick) => {
    context.fillStyle = brick.color;
    context.fillRect(brick.x, brick.y, brick.width, brick.height);
  });

  context.fillStyle = "black";
  context.fillRect(
    data.paddle.x,
    data.paddle.y,
    data.paddle.width,
    data.paddle.height
  );
}

function loop() {
  if (data.bricks.length === 0) {
    modalText.innerText = "Yay you win";
    modal.style.display = "block";
    return;
  }

  requestAnimationFrame(loop);
  update();
  drow();
}

document.addEventListener("keydown", function (e) {
  if (e.code === "ArrowLeft") {
    data.paddle.xDelta = -3;
  } else if (e.code === "ArrowRight") {
    data.paddle.xDelta = 3;
  }

  if (data.ball.xDelta === 0 && data.ball.yDelta === 0 && e.code === "Space") {
    Math.random() >= 0.5
      ? ((data.ball.xDelta = data.ball.speed),
        (data.ball.yDelta = data.ball.speed))
      : ((data.ball.xDelta = -data.ball.speed),
        (data.ball.yDelta = -data.ball.speed));
  }
});

document.addEventListener("keyup", function (e) {
  if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
    data.paddle.xDelta = 0;
  }
});

restartBtn.addEventListener("click", () => {
  location.reload();
});

startGame();
loop();
