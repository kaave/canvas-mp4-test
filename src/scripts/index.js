import 'babel-polyfill'; // アプリ内で1度だけ読み込む エントリーポイントのてっぺん推奨

import * as CanvasFilters from './modules/CanvasFilters';

const sourceWidthPx = 640;
const sourceHeightPx = 480;

function getAndInitCanvasSize(canvasElementSelector) {
  const element = document.querySelector(canvasElementSelector);
  const { width, height } = element.getBoundingClientRect();
  element.setAttribute('width', width);
  element.setAttribute('height', height);
  return { element, width, height };
}

function writeAndRecursive(context, video, timeoutMSec, width, height) {
  context.drawImage(video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
  const nextIntervalMSec = Math.sin(((new Date().getSeconds() % 15 * 6)) * (Math.PI / 180)) * 500;
  setTimeout(() => writeAndRecursive(context, video, nextIntervalMSec, width, height), timeoutMSec + 10);
}

class Main {
  constructor() {
    this.onDOMContentLoaded = this.onDOMContentLoaded.bind(this);
  }

  onDOMContentLoaded() {
    this.video = document.querySelector('video');

    this.initMosaic();
    this.initGrayScale();
    this.initShock();
    this.initBitmap();
    this.initSepia();
    this.initGlitchLine();
    this.initGlitchVertical();
    this.initGlitchHorizontal();
    this.initCenterDup();
    this.initMirror();
    // this.init10Frames();
    // this.initQuartet();
    // this.initCenterReverse();
    // this.initSequence();
    // this.initStopAndGo();
    // this.initSineCycle();
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
    setInterval(() => this.mirrorContext.drawImage(CanvasFilters.mirror({
      widthPx: width,
      heightPx: height,
      sourceElement: this.video,
    }), 0, 0), 1000 / 20);
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

    setInterval(() => {
      // const mosaicSizeThreshold = Math.ceil(new Date().getMilliseconds() / 50) + 1;
      // const mosaicPx = mosaicSizeThreshold > 20 ? 20 : mosaicSizeThreshold;
      const mosaicPx = 12;
      const mosaicedCanvas = CanvasFilters.mosaic({
        mosaicPx,
        widthPx: width,
        heightPx: height,
        sourceElement: this.video,
      });

      this.mosaicContext.drawImage(mosaicedCanvas, 0, 0);
    }, 1000 / 10);
  }

  initGrayScale() {
    const { element, width, height } = getAndInitCanvasSize('.gray');
    this.grayContext = element.getContext('2d');

    setInterval(() => this.grayContext.drawImage(CanvasFilters.grayScale({
      widthPx: width,
      heightPx: height,
      sourceElement: this.video,
    }), 0, 0), 1000 / 10);
  }

  initShock() {
    const { element, width, height } = getAndInitCanvasSize('.shock');
    this.shockContext = element.getContext('2d');

    setInterval(() => this.shockContext.drawImage(CanvasFilters.reverseColor({
      widthPx: width,
      heightPx: height,
      sourceElement: this.video,
    }), 0, 0), 1000 / 10);
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

  initGlitchLine() {
    const { element, width, height } = getAndInitCanvasSize('.glitch-line');
    this.glitchLineContext = element.getContext('2d');

    setInterval(() => this.glitchLineContext.drawImage(CanvasFilters.glitchLine({
      widthPx: width,
      heightPx: height,
      sourceElement: this.video,
    }), 0, 0), 1000 / 10);
  }

  initGlitchVertical() {
    const { element, width, height } = getAndInitCanvasSize('.glitch-vertical');
    this.glitchVerticalContext = element.getContext('2d');

    setInterval(() => {
      if (Math.random() < 0.7) {
        this.glitchVerticalContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      } else {
        this.glitchVerticalContext.drawImage(CanvasFilters.glitchVertical({
          widthPx: width,
          heightPx: height,
          sourceElement: this.video,
          sliceSizePx: Math.floor(Math.random() * 50) + 1,
        }), 0, 0);
      }
    }, 1000 / 10);
  }

  initGlitchHorizontal() {
    const { element, width, height } = getAndInitCanvasSize('.glitch-horizontal');
    this.glitchHorizontalContext = element.getContext('2d');

    setInterval(() => {
      if (Math.random() < 0.7) {
        this.glitchHorizontalContext.drawImage(this.video, 0, 0, sourceWidthPx, sourceHeightPx, 0, 0, width, height);
      } else {
        this.glitchHorizontalContext.drawImage(CanvasFilters.glitchHorizontal({
          widthPx: width,
          heightPx: height,
          sourceElement: this.video,
          sliceSizePx: Math.floor(Math.random() * 50) + 1,
        }), 0, 0);
      }
    }, 1000 / 10);
  }

  initBitmap() {
    const { element, width, height } = getAndInitCanvasSize('.bitmap');
    this.bitmapContext = element.getContext('2d');

    setInterval(() => this.bitmapContext.drawImage(CanvasFilters.bitmap({
      widthPx: width,
      heightPx: height,
      sourceElement: this.video,
    }), 0, 0), 1000 / 10);
  }

  initSepia() {
    const { element, width, height } = getAndInitCanvasSize('.sepia');
    this.sepiaContext = element.getContext('2d');

    setInterval(() => this.sepiaContext.drawImage(CanvasFilters.sepia({
      widthPx: width,
      heightPx: height,
      sourceElement: this.video,
    }), 0, 0), 1000 / 10);
  }

  initCenterDup() {
    const { element, width, height } = getAndInitCanvasSize('.center-dup');
    this.centerDupContext = element.getContext('2d');

    setInterval(() => this.centerDupContext.drawImage(CanvasFilters.centerDuplicate({
      widthPx: width,
      heightPx: height,
      sourceElement: this.video,
      isHorizontal: true,
    }), 0, 0), 1000 / 10);
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
