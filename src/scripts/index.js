import 'babel-polyfill'; // アプリ内で1度だけ読み込む エントリーポイントのてっぺん推奨

const sourceWidthPx = 640;
const sourceHeightPx = 360;

function getAndInitCanvasSize(canvasElementSelector) {
  const element = document.querySelector(canvasElementSelector);
  const { width, height } = element.getBoundingClientRect();
  element.setAttribute('width', width);
  element.setAttribute('height', height);
  return { element, width, height };
}

class Main {
  constructor() {
    this.onDOMContentLoaded = this.onDOMContentLoaded.bind(this);
  }

  onDOMContentLoaded() {
    this.video = document.querySelector('video');

    this.init10Frames();
    this.initQuartet();
    this.initCenterReverse();
    this.initMirror();
  }

  init10Frames() {
    const { element, width, height } = getAndInitCanvasSize('.ten-frames');
    this.tenFramesContext = element.getContext('2d');
    setInterval(() => this.tenFramesContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height), 1000 / 10);
  }

  initQuartet() {
    const { element, width, height } = getAndInitCanvasSize('.quartet');
    this.quartetContext = element.getContext('2d');
    const centerWidth = width / 2;
    const centerHeight = height / 2;
    setInterval(() => {
      this.quartetContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, centerWidth, centerHeight);
      this.quartetContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, centerWidth, 0, centerWidth, centerHeight);
      this.quartetContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, centerHeight, centerWidth, centerHeight);
      this.quartetContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, centerWidth, centerHeight, centerWidth, centerHeight);
    }, 1000 / 30);
  }

  initCenterReverse() {
    const { element, width, height } = getAndInitCanvasSize('.center-reverse');
    this.centerReverseContext = element.getContext('2d');
    const sourceCenterWidth = sourceWidthPx / 2;
    const centerWidth = width / 2;
    setInterval(() => {
      this.centerReverseContext.drawImage(this.video, 0, 0, sourceCenterWidth, sourceHeightPx, centerWidth, 0, centerWidth, height);
      this.centerReverseContext.drawImage(this.video, sourceCenterWidth, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
    }, 1000 / 30);
  }

  initMirror() {
    const { element, width, height } = getAndInitCanvasSize('.mirror');
    this.mirrorContext = element.getContext('2d');
    this.mirrorContext.translate(width, 0); // ひっくり返すので、その分移動する
    this.mirrorContext.scale(-1, 1);
    setInterval(() => {
      this.mirrorContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
    }, 1000 / 30);
  }

  initRandomYellowBox() {
    setInterval(() => {
      this.tenFramesContext.shadowBlur = 15;//  shadow Blur
      this.tenFramesContext.shadowColor = '#009933'; // shadow color
      this.tenFramesContext.drawImage(this.video, 0, 0);
      this.tenFramesContext.fillStyle = 'rgba(189, 254, 34, 0.3)'; // fill color
      this.tenFramesContext.fillRect(70, 20, 400, 200); // rectangle
    }, 1000 / 10);
  }
}

const main = new Main();
window.addEventListener('DOMContentLoaded', main.onDOMContentLoaded);
