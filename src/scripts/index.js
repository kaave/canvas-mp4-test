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

// 参考: https://www.ipentec.com/document/document.aspx?page=html-canvas-create-mosic-image
function createMosaic({ context, imageData, width, height, mosaicSizePx }) {
  for (let y = 0; y < height; y += mosaicSizePx) {
    for (let x = 0; x < width; x += mosaicSizePx) {
      const dataBaseIndex = ((y * width) + x) * 4;
      // imageData.dataには1px毎のデータがrgba順の10進数で入っている
      const r = imageData.data[dataBaseIndex];
      const g = imageData.data[dataBaseIndex + 1];
      const b = imageData.data[dataBaseIndex + 2];

      context.fillStyle = `rgb(${r},${g},${b})`;
      context.fillRect(x, y, x + mosaicSizePx, y + mosaicSizePx);
    }
  }
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
    this.initSequence();
    this.initMosaic();
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

  initSequence() {
    const sequenceCount = 9;
    this.lastViewList = [];
    const { element, width, height } = getAndInitCanvasSize('.sequence');
    this.sequenceContext = element.getContext('2d');
    const thresholdWidth = width / 3;
    const thresholdHeight = height / 3;
    setInterval(() => {
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = width;
      tmpCanvas.height = height;
      const tmpContext = tmpCanvas.getContext('2d');
      tmpContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      this.lastViewList.push(tmpCanvas);

      const lastViewListLength = this.lastViewList.length;
      if (lastViewListLength > sequenceCount) {
        this.lastViewList.splice(0, lastViewListLength - sequenceCount);
        this.sequenceContext.drawImage(this.lastViewList[8], 0, 0, width, height, 0, 0, thresholdWidth, thresholdHeight);
        this.sequenceContext.drawImage(this.lastViewList[7], 0, 0, width, height, thresholdWidth, 0, thresholdWidth, thresholdHeight);
        this.sequenceContext.drawImage(this.lastViewList[6], 0, 0, width, height, thresholdWidth * 2, 0, thresholdWidth, thresholdHeight);
        this.sequenceContext.drawImage(this.lastViewList[5], 0, 0, width, height, 0, thresholdHeight, thresholdWidth, thresholdHeight);
        this.sequenceContext.drawImage(this.lastViewList[4], 0, 0, width, height, thresholdWidth, thresholdHeight, thresholdWidth, thresholdHeight);
        this.sequenceContext.drawImage(this.lastViewList[3], 0, 0, width, height, thresholdWidth * 2, thresholdHeight, thresholdWidth, thresholdHeight);
        this.sequenceContext.drawImage(this.lastViewList[2], 0, 0, width, height, 0, thresholdHeight * 2, thresholdWidth, thresholdHeight);
        this.sequenceContext.drawImage(this.lastViewList[1], 0, 0, width, height, thresholdWidth, thresholdHeight * 2, thresholdWidth, thresholdHeight);
        this.sequenceContext.drawImage(this.lastViewList[0], 0, 0, width, height, thresholdWidth * 2, thresholdHeight * 2, thresholdWidth, thresholdHeight);
      }
    }, 1000 / 10);
  }

  initMosaic() {
    const { element, width, height } = getAndInitCanvasSize('.mosaic');
    this.mosaicContext = element.getContext('2d');
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpContext = tmpCanvas.getContext('2d');
    setInterval(() => {
      tmpContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      const imageData = tmpContext.getImageData(0, 0, width, height);
      createMosaic({
        imageData,
        width,
        height,
        context: tmpContext,
        mosaicSizePx: 12,
      });
      this.mosaicContext.drawImage(tmpCanvas, 0, 0);
    }, 1000 / 10);
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
