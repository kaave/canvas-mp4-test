import 'babel-polyfill'; // アプリ内で1度だけ読み込む エントリーポイントのてっぺん推奨

import sepiaArray from './_sepiaArray';

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

function writeAndRecursive(context, video, timeoutMSec, width, height) {
  context.drawImage(video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
  const nextIntervalMSec = Math.sin(((new Date().getSeconds() % 15 * 6)) * (Math.PI / 180)) * 500;
  setTimeout(() => writeAndRecursive(context, video, nextIntervalMSec, width, height), timeoutMSec + 10);
}

function getRandom({ min, max }) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
    this.initGrayScale();
    this.initShock();
    this.initRGB();
    this.initStopAndGo();
    this.initSineCycle();
    this.initGlitchOne();
    this.initGlitchTwo();
    this.initBitmap();
    this.initSepia();
    this.initCenterDup();
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
      this.centerReverseContext.drawImage(this.video, sourceCenterWidth, 0, sourceCenterWidth, sourceHeightPx, 0, 0, centerWidth, height);
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

  initGrayScale() {
    const { element, width, height } = getAndInitCanvasSize('.gray');
    this.grayContext = element.getContext('2d');
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpContext = tmpCanvas.getContext('2d');
    setInterval(() => {
      tmpContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      const imageData = tmpContext.getImageData(0, 0, width, height);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        const brightness = (0.34 * data[i]) + (0.5 * data[i + 1]) + (0.16 * data[i + 2]);
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
      }
      this.grayContext.putImageData(imageData, 0, 0);
    }, 1000 / 10);
  }

  initShock() {
    const { element, width, height } = getAndInitCanvasSize('.shock');
    this.shockContext = element.getContext('2d');
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpContext = tmpCanvas.getContext('2d');
    setInterval(() => {
      tmpContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      const imageData = tmpContext.getImageData(0, 0, width, height);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      this.shockContext.putImageData(imageData, 0, 0);
    }, 1000 / 10);
  }

  initRGB() {
    const { element, width, height } = getAndInitCanvasSize('.rgb');
    this.rgbContext = element.getContext('2d');
    const sourceCenterWidthPx = sourceWidthPx / 2;
    const sourceCenterHeightPx = sourceHeightPx / 2;
    const centerWidth = width / 2;
    const centerHeight = height / 2;

    setInterval(() => {
      const canvases = [];
      for (let i = 0; i < 4; i += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = centerWidth;
        canvas.height = centerHeight;
        const context = canvas.getContext('2d');
        canvases.push({ canvas, context });
      }

      canvases[0].context.drawImage(this.video, 0, 0, sourceCenterWidthPx, sourceCenterHeightPx, 0, 0, centerWidth, centerHeight);
      canvases[1].context.drawImage(this.video, sourceCenterWidthPx, 0, sourceCenterWidthPx, sourceCenterHeightPx, 0, 0, centerWidth, centerHeight);
      canvases[2].context.drawImage(this.video, 0, sourceCenterHeightPx, sourceCenterWidthPx, sourceCenterHeightPx, 0, 0, centerWidth, centerHeight);
      canvases[3].context.drawImage(this.video, sourceCenterWidthPx, sourceCenterHeightPx, sourceCenterWidthPx, sourceCenterHeightPx, 0, 0, centerWidth, centerHeight);

      canvases[0].imageData = canvases[0].context.getImageData(0, 0, centerWidth, centerHeight);
      canvases[1].imageData = canvases[1].context.getImageData(0, 0, centerWidth, centerHeight);
      canvases[2].imageData = canvases[2].context.getImageData(0, 0, centerWidth, centerHeight);

      const data0 = canvases[0].imageData.data;
      for (let i = 0; i < data0.length; i += 4) {
        data0[i] = 0;
      }
      this.rgbContext.putImageData(canvases[0].imageData, 0, 0);
      const data1 = canvases[1].imageData.data;
      for (let i = 0; i < data1.length; i += 4) {
        data1[i + 1] = 0;
      }
      this.rgbContext.putImageData(canvases[1].imageData, centerWidth, 0);
      const data2 = canvases[2].imageData.data;
      for (let i = 0; i < data2.length; i += 4) {
        data2[i + 2] = 0;
      }
      this.rgbContext.putImageData(canvases[2].imageData, 0, centerHeight);
      this.rgbContext.drawImage(canvases[3].canvas, centerWidth, centerHeight, centerWidth, centerHeight);
    }, 1000 / 10);
  }

  initStopAndGo() {
    const { element, width, height } = getAndInitCanvasSize('.stop-and-go');
    this.stopAndGoContext = element.getContext('2d');
    const canvases = [];
    setInterval(() => {
      const now = new Date();
      if (now.getSeconds() % 3 === 0 && canvases.length > 0) {
        const canvasesIndex = Math.floor(Math.random() * 5);
        this.stopAndGoContext.drawImage(canvases[canvasesIndex], 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = sourceWidthPx;
        canvas.height = sourceHeightPx;
        const tmpContext = canvas.getContext('2d');
        tmpContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, sourceWidthPx, sourceHeightPx);
        canvases.push(canvas);
        if (canvases.length > 5) {
          canvases.splice(0, canvases.length - 5);
        }
        this.stopAndGoContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height)
      }
    }, 1000 / 30);
  }

  initSineCycle() {
    const { element, width, height } = getAndInitCanvasSize('.sine-cycle');
    this.sineCycleContext = element.getContext('2d');
    writeAndRecursive(this.sineCycleContext, this.video, 100, width, height);
  }

  initGlitchOne() {
    const { element, width, height } = getAndInitCanvasSize('.glitch-one');
    this.glitchOneContext = element.getContext('2d');
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpContext = tmpCanvas.getContext('2d');
    setInterval(() => {
      tmpContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      const imageData = tmpContext.getImageData(0, 0, width, height);
      const { data } = imageData;
      const randR = Math.floor(Math.random() * 5) * 2;
      const randG = Math.floor(Math.random() * 5) * 2;
      const randB = Math.floor(Math.random() * 5);
      for (let i = 0, l = data.length; i < l; i += 4) {
        data[i * 4] = data[(i + randR) * 4];
        data[i * 4 + 1] = data[(i + randG) * 4 + 1];
        data[i * 4 + 2] = data[(i + randB) * 4 + 2];
      }

      this.glitchOneContext.putImageData(imageData, 0, 0);
    }, 1000 / 20);
  }

  initGlitchTwo() {
    const { element, width, height } = getAndInitCanvasSize('.glitch-two');
    this.glitchTwoContext = element.getContext('2d');
    const verticalSlices = Math.round(sourceHeightPx / 20);
    const verticalContextSlices = Math.round(height / 20);
    const maxHorizOffset = 20;
    setInterval(() => {
      if (Math.random() < 0.7) {
        this.glitchTwoContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      } else {
        for (let i = 0; i < verticalSlices; i += 1) {
          const horizOffset = getRandom({ max: -Math.abs(maxHorizOffset), min: maxHorizOffset });
          this.glitchTwoContext.drawImage(this.video,
            0,
            i * verticalSlices,
            sourceWidthPx,
            i * verticalSlices + verticalSlices,
            horizOffset,
            i * verticalContextSlices,
            width,
            i * verticalContextSlices + verticalContextSlices
          );
        }
      }
    }, 1000 / 10);
  }

  initBitmap() {
    const { element, width, height } = getAndInitCanvasSize('.bitmap');
    this.bitmapContext = element.getContext('2d');
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpContext = tmpCanvas.getContext('2d');
    setInterval(() => {
      tmpContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      const imageData = tmpContext.getImageData(0, 0, width, height);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] * 0.2126;
        const g = data[i + 1] * 0.7152;
        const b = data[i + 2] * 0.0722;
        const v = (r + g + b >= 128) ? 255 : 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
      this.bitmapContext.putImageData(imageData, 0, 0);
    }, 1000 / 10);
  }

  initSepia() {
    const { element, width, height } = getAndInitCanvasSize('.sepia');
    this.sepiaContext = element.getContext('2d');
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpContext = tmpCanvas.getContext('2d');
    setInterval(() => {
      tmpContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      const imageData = tmpContext.getImageData(0, 0, width, height);
      const { data } = imageData;
      let noise = 20;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = sepiaArray.r[data[i]];
        data[i + 1] = sepiaArray.g[data[i + 1]];
        data[i + 2] = sepiaArray.b[data[i + 2]];

        noise = Math.round(noise - (Math.random() * noise));
        for (let j = 0; j < 3; j += 1) {
          const iPN = noise + data[i + j];
          imageData.data[i + j] = (iPN > 255) ? 255 : iPN;
        }
      }
      this.sepiaContext.putImageData(imageData, 0, 0);
    }, 1000 / 10);
  }

  initCenterDup() {
    const { element, width, height } = getAndInitCanvasSize('.center-dup');
    this.centerDupContext = element.getContext('2d');
    const sourceCenterWidth = sourceWidthPx / 2;
    const centerWidth = width / 2;
    setInterval(() => {
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = sourceCenterWidth;
      tmpCanvas.height = height;
      const tmpContext = tmpCanvas.getContext('2d');
      tmpContext.translate(sourceCenterWidth, 0); // ひっくり返すので、その分移動する
      tmpContext.scale(-1, 1);
      tmpContext.drawImage(this.video, 0, 0, sourceCenterWidth, sourceHeightPx, 0, 0, sourceCenterWidth, height);

      this.centerDupContext.drawImage(this.video, 0, 0, sourceCenterWidth, sourceHeightPx, 0, 0, centerWidth, height);
      this.centerDupContext.drawImage(tmpCanvas, 0, 0, sourceCenterWidth, height, centerWidth, 0, centerWidth, height);
    }, 1000 / 30);
  }

  // initRandomYellowBox() {
  //   setInterval(() => {
  //     this.tenFramesContext.shadowBlur = 15;//  shadow Blur
  //     this.tenFramesContext.shadowColor = '#009933'; // shadow color
  //     this.tenFramesContext.drawImage(this.video, 0, 0);
  //     this.tenFramesContext.fillStyle = 'rgba(189, 254, 34, 0.3)'; // fill color
  //     this.tenFramesContext.fillRect(70, 20, 400, 200); // rectangle
  //   }, 1000 / 10);
  // }
}

const main = new Main();
window.addEventListener('DOMContentLoaded', main.onDOMContentLoaded);
