const images = []; seed = (new Date()).getMilliseconds(); let isPaused = false;
let highScore = localStorage.getItem("score") != null ? localStorage.getItem("score") : 0;
let money = localStorage.getItem("money") != null ? (localStorage.getItem("money") * 1) : 0;


function startGame() {
  layers[0].context.font = "100px Monaco, monospace";
  for (let i = 0; i < 3; i++) { layers.push(new Layer()); layers[1 + i].context.font = "100px Monaco, monospace"; }
  layers[3].context.textAlign = "left"; layers[3].context.textBaseline = "middle";
  objects.push(new MoneyText()); loadMenu();
}


function loadGame() {
  clearObjects(); isPaused = false; objects.push(new Background()); objects.push(new Control());
  objects.push(new Player(images[0])); objects.push(new LevelGenerator());
  objects[1].render(); objects.push(new ScoreText());
}


function loadMenu() {
  clearObjects(); objects.push(new StartButton()); // objects.push(new ShopButton());
  objects[1].render(); renderImage(images[5], new Vector4(50, 50, 100, 100), 3); layers[3].context.fillText(highScore, 120, 60);
}


function loadShop() {
  clearObjects(); objects.push(new BackButton()); objects.push(new BuyButton());
  objects[1].render(); renderImage(images[5], new Vector4(50, 50, 100, 100), 3); layers[3].context.fillText(highScore, 120, 60);
}


function clearObjects() {
  for (let i = objects.length; i > 1; i--) objects.splice(i, 1);
  for (let i = 0; i < layers.length; i++) clearTransform(new Vector4(540, 960, 1080, 1920), i);
}


function death() {
  isPaused = true; objects.push(new EmptyButton()); objects.push(new RestartButton());
  objects.push(new ShareButton()); objects.push(new HomeButton());
}


class Loader {
  constructor(images_count) { this.images_count = images_count; this.load_progress = 0; }

  load() {
    for (let i = 0; i < this.images_count; i++) {
      images.push(new Image()); images[i].src = "resources/images/" + i + ".png";
      images[i].onload = () => this.setLoadProgress(this.load_progress + 1);
    }
  }

  setLoadProgress(load_progress) {
    this.load_progress = load_progress; console.log("loading: " + this.load_progress / this.images_count * 100 + "%");
    if (this.load_progress === this.images_count) startGame();
  }
}

// menu
class MenuButton extends Button {
  constructor(x, y, width, height, img) {
    super(x, y, 0, 0); this.img = img; this.render();
    this.start = true; this.finalSize = new Vector2(width, height);
  }

  lateUpdate() {
    super.lateUpdate();
    if (!this.start) return;
    if (this.transform.size.x < this.finalSize.x) this.transform.size.x += this.finalSize.x / 20;
    if (this.transform.size.y < this.finalSize.y) this.transform.size.y += this.finalSize.x / 20;
    this.start = this.transform.size.x < this.finalSize.x & this.transform.size.y < this.finalSize.y;
    this.render();
  }

  render() { renderImage(this.img, this.transform, 3); }
  animate(value) {
    clearTransform(this.transform, 3);
    this.transform.size.x += value;
    this.transform.size.y += value;
    this.render();
  }

  onInterrupt() { this.animate(20); }
  onRelease() { this.animate(20); }
  onPress() { this.animate(-20); }
}


class StartButton extends MenuButton {
  constructor() { super(540, 960, 500, 500, images[4]); }
  onRelease() { super.onRelease(); loadGame(); }
}


class ShopButton extends MenuButton {
  constructor() { super(540 - 200, 960 + 400, 300, 300, images[4]); }
  onRelease() { super.onRelease(); loadShop(); }
}


class BackButton extends MenuButton {
  constructor() { super(200, 1920 - 200, 300, 300, images[4]); }
  onRelease() { super.onRelease(); loadMenu(); }
}


class BuyButton extends MenuButton {
  constructor() {
    super(540, 960, 500, 500, images[4]);
    
  }
  onRelease() { super.onRelease(); }
}


class MoneyText extends GameObject {
  constructor() { super(50, 150, 100, 100); }
  setMoney(value) { money = value; this.render(); }
  render() {
    clearTransform(new Vector4(540, this.transform.position.y, 1080, this.transform.size.y), 3);
    renderImage(images[2], this.transform, 3);
    layers[3].context.fillText(money, this.transform.position.x + 70, this.transform.position.y + 10);
  }
}


class EmptyButton extends MenuButton {
  constructor() { super(540, 960 - 175, 550, 550, images[6]); }
  // onRelease() { super.onRelease(); window.open("", "_blank"); }
}


class RestartButton extends MenuButton {
  constructor() { super(540, 960 + 400, 300, 300, images[7]); }
  onRelease() { super.onRelease(); loadGame(); }
}


class ShareButton extends MenuButton {
  constructor() { super(540 + 300, 960 + 250, 250, 250, images[9]); }
  onRelease() {
    super.onRelease();
    if (navigator.share) {
      navigator.share({
        title: "Bunny",
        // text: "Мой результат:" + float2int(objects[6].score),
        url: window.location.href
      }).then(function () { }).catch(function () { })
    }
  }
}


class HomeButton extends MenuButton {
  constructor() { super(540 - 300, 960 + 250, 250, 250, images[8]); }
  onRelease() { super.onRelease(); loadMenu(); }
}
// menu

// game
class Background extends GameObject {
  constructor() { super(540, 960, 1080, 1920); this.speed = 10; this.x = 0; }
  lateUpdate() {
    if (!isPaused) {
      clearTransform(this.transform, 1); clearTransform(this.transform, 2);
      this.render();
    }
  }
  render() {
    this.x -= this.speed; if (this.x <= -2560) this.x = 0;
    renderImage(images[3], new Vector4(this.x, this.transform.position.y, 2560, this.transform.size.y), 0);
    renderImage(images[3], new Vector4(this.x + 2560, this.transform.position.y, 2560, this.transform.size.y), 0);
  }
}


class Control extends Button {
  constructor() { super(540, 960, 1080, 1920); }
  onPress() { if (!isPaused) objects[4].tap(); }
}


class Player extends GameObject {
  constructor(img) { super(540, 960, 200, 200); this.img = img; this.speed = -30; this.weight = 5; }

  update() {
    if (!isPaused) {
      this.speed += 1 / 6 * this.weight; this.transform.position.y += float2int(this.speed);
      if (this.transform.position.y > 1920 + this.transform.size.y / 2) { death(); }
    }
  }

  lateUpdate() { if (!isPaused) this.render(); }

  render() {
    this.transform.size.x = float2int(10000 / abs(this.speed)); if (this.transform.size.x > 200) this.transform.size.x = 200;
    this.transform.size.y = float2int((abs(this.speed) * 4.5)); if (this.transform.size.y < 200) this.transform.size.y = 200;
    renderImage(this.img, this.transform, 1);
  }

  tap() { this.speed = 49; }

  collision(other) {
    if (other.constructor.name === "Platform") {
      let a = this.transform.position.y < other.transform.position.y;
      this.transform.position.y = other.transform.position.y + (other.transform.size.y + this.transform.size.y) / 2 * (a ? -1 : 1);
      this.speed /= a ? -1.5 : 2;
    }
  }
}


class LevelGenerator extends GameObject {
  constructor() { super(0, 0, 0, 0); this.timeout = 0; this.counter = 1; }
  update() { if (isPaused) return; this.counter += 1 / (this.timeout * 60); if (this.counter >= 1) { this.counter = 0; this.timesup(); } }
  timesup() {
    let y = 960 + float2int(random() * (960 - 100 / 2));
    objects.push(new Platform(y)); if (random() * 100 <= 5) objects.push(new Coin(y - 150));
    this.timeout = float2int(random() * 100 + 50) / 100;
  }
}


class Platform extends GameObject {
  constructor(y) { super(1180, y, 200, 1); this.speed = 10; this.img = 10 + float2int(random() * 4); }

  update() { if (isPaused) return; this.transform.position.x -= this.speed; if (this.transform.position.x < -100) this.destroyed = true; }
  lateUpdate() { if (!isPaused) this.render(); }
  render() { renderImage(images[this.img], new Vector4(this.transform.position.x, this.transform.position.y, 200, 70), 2); }

  collision() { }
}


class ScoreText extends GameObject {
  constructor() { super(50, 50, 100, 100); this.score = 0; }

  update() {
    if (isPaused) return;
    this.score += 1 / 60;
    if (float2int(this.score) > float2int(highScore)) {
      highScore = float2int(this.score);
      localStorage.setItem("score", highScore);
    }
  }
  lateUpdate() { if (!isPaused) this.render(); }
  render() {
    clearTransform(new Vector4(540, this.transform.position.y, 1080, this.transform.size.y), 3);
    renderImage(images[5], this.transform, 3);
    layers[3].context.fillText(float2int(this.score), this.transform.position.x + 70, this.transform.position.y + 10);
  }
}


class Coin extends GameObject {
  constructor(y) { super(1180, y, 150, 150); this.speed = 10; }

  update() { if (isPaused) return; this.transform.position.x -= this.speed; if (this.transform.position.x < -100) this.destroyed = true; }
  lateUpdate() { if (!isPaused) this.render(); }
  render() { renderImage(images[2], this.transform, 2); }

  collision(other) {
    if (other.constructor.name === "Player") {
      objects[1].setMoney(money + 1);
      localStorage.setItem("money", money);
      this.destroyed = true;
    }
  }
}
// game


const loader = new Loader(14); loader.load();
