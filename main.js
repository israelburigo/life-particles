const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const particles = [];

zoom = 1;
maxSpeed = 10;
origin = { x: 0, y: 0 };
dragStart = { x: 0, y: 0 };

yellow = create(300, "yellow");
red = create(300, "red");
green = create(300, "green");
blue = create(300, "blue");
loop();

async function loop() {
  await Promise.all([
    rule(red, red, .5, 50),
    rule(red, yellow, -0.25, 100),
    rule(red, green, -0.25, 100),

    rule(yellow, yellow, -0.05, 1000),
    rule(yellow, red, -0.05, 100),
    rule(yellow, green, 5, 10),
    rule(yellow, blue, 1, 30),

    rule(green, yellow, -0.2, 100),
    rule(green, red, .5, 50),
    rule(green, green, .5, 20),

    rule(blue, red, 2.5, 30),
    rule(blue, yellow, -.5, 100),
  ]);

  clear();
  for (const p of particles) {
    draw(p.x, p.y, p.color);
  }

  context.fillStyle = "white";
  context.fillText(`${zoom}`, 5, canvas.clientHeight - 10);
  requestAnimationFrame(loop);
}

function draw(x, y, c) {
  context.fillStyle = c;
  x = x * zoom + origin.x;
  y = y * zoom + origin.y;
  radius = 5 * zoom;
  context.fillRect(x, y, radius, radius);
}

function clear() {
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

function particle(x, y, color) {
  return { x, y, color, vx: 0, vy: 0 };
}

function random() {
  return (
    Math.random() *
      Math.min(canvas.clientHeight - 100, canvas.clientWidth - 100) +
    50
  );
}

function create(n, color) {
  group = [];
  while (--n) {
    p = particle(random(), random(), color);
    group.push(p);
    particles.push(p);
  }
  return group;
}

async function rule(group1, group2, k, limit) {
  if (!group1 || !group2) return;

  for (const p1 of group1) {
    fx = 0;
    fy = 0;
    for (const p2 of group2) {
      if (p1 == p2) continue;
      dx = p1.x - p2.x;
      dy = p1.y - p2.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0 && d < limit) {
        f = k / d;
        fx += f * dx;
        fy += f * dy;
      }
    }
    p1.vx = (p1.vx + fx) * 0.5;
    p1.vy = (p1.vy + fy) * 0.5;
    if (p1.vx > maxSpeed) p1.vx = maxSpeed;
    if (p1.vx < -maxSpeed) p1.vx = -maxSpeed;
    if (p1.vy > maxSpeed) p1.vy = maxSpeed;
    if (p1.vy < -maxSpeed) p1.vy = -maxSpeed;

    p1.x += p1.vx;
    p1.y += p1.vy;
  }
}

canvas.addEventListener(
  "wheel",
  function (event) {
    before = { x: (event.x - origin.x) / zoom, y: (event.y - origin.y) / zoom };

    if (event.deltaY < 0) zoom *= 1.01;
    else if (event.deltaY > 0) zoom *= 0.99;

    after = { x: (event.x - origin.x) / zoom, y: (event.y - origin.y) / zoom };

    x = (after.x - before.x) * zoom;
    y = (after.y - before.y) * zoom;

    origin.x += x;
    origin.y += y;

    event.preventDefault();
  },
  false
);

canvas.addEventListener("mousedown", function (event) {
  dragStart = { x: event.x, y: event.y };
  drag = true;
});

canvas.addEventListener("mouseup", function (event) {
  drag = false;
});

canvas.addEventListener("mousemove", function (event) {
  if (drag) {
    origin.x += event.x - dragStart.x;
    origin.y += event.y - dragStart.y;
  }
  dragStart.x = event.x;
  dragStart.y = event.y;
});
