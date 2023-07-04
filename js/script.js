const canvas = document.querySelector(".game__board");
const context = canvas.getContext("2d");

const startInfo = document.querySelector(".info__start");

const score = document.querySelector(".info__score--green");
score.innerText = 0;

const fail = document.querySelector(".info__fail--red");
fail.innerText = 0;

const restartBtn = document.querySelector(".game__restart");

const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const modalText = document.querySelector(".modal__text");

const paddleWidth = 80;
const paddleHeight = 10;
const paddleY = 30;
const paddleXDelta = 3;

const ballSize = 10;
const ballSpeed = 4;

const brickHeight = 20;

let lose = false;

let data = {};

function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.size > obj2.y
  );
}

function randomColor() {
  let myRed = Math.floor(Math.random() * 256);
  let myGreen = Math.floor(Math.random() * 256);
  let myBlue = Math.floor(Math.random() * 256);
  return `rgb(${myRed}, ${myGreen}, ${myBlue})`;
}

function createGameData() {
  data = {
    wall: {
      size: 2,
    },

    bricks: [],

    ball: {
      x: canvas.width / 2 - ballSize / 2,
      y: canvas.height - paddleY - paddleHeight,
      size: ballSize,
      speed: ballSpeed,
      xDelta: 0,
      yDelta: 0,
    },

    paddle: {
      x: canvas.width / 2 - paddleWidth / 2,
      y: canvas.height - paddleY,
      width: paddleWidth,
      height: paddleHeight,
      xDelta: 0,
    },
  };

  const brick = {};

  brick.x = Math.ceil(Math.random() * 5 + 3);

  for (let row = 0; row < brick.x; row++) {
    brick.y = Math.ceil(Math.random() * 5 + 3);

    brick.width = (canvas.width - data.wall.size * 2) / brick.y;

    for (let col = 0; col < brick.y; col++) {
      const colorCode = randomColor();

      data.bricks.push({
        x: data.wall.size + brick.width * col,
        y: data.wall.size + brickHeight * row,
        color: colorCode,
        width: brick.width,
        height: brickHeight,
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
    data.ball.y = data.paddle.y - data.ball.size;
    data.ball.xDelta = 0;
    data.ball.yDelta = 0;

    startInfo.classList.remove("info__start--opacity");
    lose = true;
  }

  if (collides(data.ball, data.paddle)) {
    if (data.ball.y + data.ball.size - data.ball.speed <= data.paddle.y) {
      data.ball.yDelta *= -1;
      data.ball.y = data.paddle.y - data.ball.size;
    } else {
      data.ball.xDelta *= -1;
      if (data.ball.x < data.paddle.x) {
        data.ball.x = data.paddle.x - data.ball.size;
      } else {
        data.ball.x = data.paddle.x + data.paddle.width;
      }
    }
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < data.bricks.length; i++) {
    const brick = data.bricks[i];

    if (collides(data.ball, brick)) {
      score.textContent = +score.textContent + 1;
      data.bricks.splice(i, 1);
      if (
        data.ball.y + data.ball.size - data.ball.speed <= brick.y ||
        data.ball.y >= brick.y + brick.height - data.ball.speed
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
  } else if (lose) {
    return;
  }

  requestAnimationFrame(loop);
  update();
  draw();
}

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

window.addEventListener("keydown", function (e) {
  if (e.code === "ArrowLeft") {
    if (data.ball.xDelta === 0 && data.ball.yDelta === 0) {
      if (data.paddle.x - paddleXDelta <= data.wall.size) {
        data.paddle.x = data.wall.size;
        draw();
        return;
      }
      data.paddle.x += -paddleXDelta;
      data.ball.x += -paddleXDelta;
      draw();
    } else {
      data.paddle.xDelta = -paddleXDelta;
    }
  }

  if (e.code === "ArrowRight") {
    if (data.ball.xDelta === 0 && data.ball.yDelta === 0) {
      if (
        data.paddle.x + data.paddle.width + paddleXDelta >=
        canvas.width - data.wall.size
      ) {
        data.paddle.x = canvas.width - data.paddle.width - data.wall.size;
        draw();
        return;
      }
      data.paddle.x += paddleXDelta;
      data.ball.x += paddleXDelta;
      draw();
    } else {
      data.paddle.xDelta = paddleXDelta;
    }
  }
});

window.addEventListener("keyup", function (e) {
  if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
    data.paddle.xDelta = 0;
  }

  if (data.ball.xDelta === 0 && data.ball.yDelta === 0 && e.code === "Space") {
    lose = false;
    startInfo.classList.add("info__start--opacity");
    e.stopPropagation();
    Math.random() >= 0.5
      ? ((data.ball.xDelta = -data.ball.speed),
        (data.ball.yDelta = -data.ball.speed))
      : ((data.ball.xDelta = data.ball.speed),
        (data.ball.yDelta = -data.ball.speed));

    loop();
  }
});

restartBtn.addEventListener("click", (e) => {
  e.target.blur();

  lose = true;

  score.innerText = 0;
  fail.innerText = 0;

  startInfo.classList.remove("info__start--opacity");

  context.clearRect(0, 0, canvas.width, canvas.height);
  createGameData();
  draw();
});

createGameData();
draw();
