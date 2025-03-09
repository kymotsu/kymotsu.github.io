let particles = [];

function setup() {
  createCanvas(600, 400);
  colorMode(HSB);
}

function draw() {
  background(0, 0, 20, 0.1);
  
  if (frameCount % 2 === 0) {
    particles.push(new Particle(mouseX, mouseY));
  }
  
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0.1);
    this.hue = random(360);
    this.size = random(5, 15);
    this.life = 255;
  }
  
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.life -= 2;
    this.pos.x += sin(frameCount * 0.1 + this.life) * 0.5;
  }
  
  display() {
    noStroke();
    fill(this.hue, 80, 100, this.life/255);
    ellipse(this.pos.x, this.pos.y, this.size);
    fill(this.hue, 60, 80, this.life/510);
    ellipse(this.pos.x, this.pos.y, this.size * 1.5);
  }
  
  isDead() {
    return this.life <= 0 || this.pos.y > height;
  }
}

function mousePressed() {
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(mouseX, mouseY));
  }
}
