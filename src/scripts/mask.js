// @flow

import 'babel-polyfill'; // アプリ内で1度だけ読み込む エントリーポイントのてっぺん推奨

import * as CanvasFilters from './modules/CanvasFilters';

class Main {
  onDOMContentLoaded: () => void;
  onChangeFrameRate: (Event) => void;
  videoElement: HTMLVideoElement;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  widthPx: number;
  heightPx: number;
  intervalID: null | number;
  frameRate: number;
  masks: string[];

  constructor() {
    this.onDOMContentLoaded = this.onDOMContentLoaded.bind(this);
    this.widthPx = 0;
    this.heightPx = 0;
    this.masks = [];
  }

  onDOMContentLoaded() {
    this.initVideoElement();
    this.initCanvasElement();
    this.initFormElements();
  }

  onChangeFrameRate({ currentTarget }: Event) {
    if (!(currentTarget instanceof HTMLSelectElement)) {
      return;
    }

    const fps = parseInt(currentTarget.value, 10);
    if (!Number.isNaN(fps)) {
      this.setPaintInterval(fps);
    }
  }

  onChangeSettingForm({ currentTarget }: Event) {
    if (!(currentTarget instanceof HTMLInputElement)) {
      return;
    }

    const { value, checked } = currentTarget;
    if (checked) {
      this.masks = [...this.masks, value];
    } else {
      const index = this.masks.indexOf(value);
      this.masks = [
        ...this.masks.slice(0, index),
        ...this.masks.slice(index + 1),
      ];
    }
  }

  initVideoElement() {
    const videoElement = document.querySelector('video');
    if (!videoElement) {
      throw new Error('Not found video element');
    }
    this.videoElement = videoElement;

    (async () => {
      if (typeof navigator.mediaDevices === 'object') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.videoElement.src = window.URL.createObjectURL(stream);
      }
    })();
  }

  initCanvasElement() {
    const canvasElement = document.querySelector('canvas');
    if (!canvasElement) {
      throw new Error('Not found canvas element');
    }

    const { width, height } = canvasElement.getBoundingClientRect();
    canvasElement.setAttribute('width', width.toString());
    canvasElement.setAttribute('height', height.toString());
    this.widthPx = width;
    this.heightPx = height;

    const context = canvasElement.getContext('2d');
    if (!context) {
      throw new Error('Cannot get CanvasRenderingContext2d');
    }
    this.canvasContext = context;

    this.setPaintInterval(5);
  }

  initFormElements() {
    // fps
    const fpsElement = document.querySelector('.setting__fps');
    if (!fpsElement) {
      return;
    }

    fpsElement.addEventListener('change', this.onChangeFrameRate.bind(this));

    // setting forms
    const formElements = Array.from(document.querySelectorAll('.setting__form input[type="checkbox"]'));
    formElements.forEach(element => element.addEventListener('change', this.onChangeSettingForm.bind(this)));
  }

  setPaintInterval(fps: number) {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }

    this.intervalID = setInterval(this.paintCanvas.bind(this), 1000 / fps);
  }

  paintCanvas() {
    let sourceElement = this.videoElement;

    this.masks.forEach((maskKey) => {
      switch (maskKey) {
        case 'mosaic':
          sourceElement = CanvasFilters.mosaic({ widthPx: this.widthPx, heightPx: this.heightPx, sourceElement, mosaicPx: 10 });
          break;
        case 'grayScale':
          sourceElement = CanvasFilters.grayScale({ widthPx: this.widthPx, heightPx: this.heightPx, sourceElement });
          break;
        case 'shock':
          sourceElement = CanvasFilters.reverseColor({ widthPx: this.widthPx, heightPx: this.heightPx, sourceElement });
          break;
        case 'bitmap':
          sourceElement = CanvasFilters.bitmap({ widthPx: this.widthPx, heightPx: this.heightPx, sourceElement });
          break;
        case 'sepia':
          sourceElement = CanvasFilters.sepia({ widthPx: this.widthPx, heightPx: this.heightPx, sourceElement });
          break;
        case 'glitchLine':
          sourceElement = CanvasFilters.glitchLine({ widthPx: this.widthPx, heightPx: this.heightPx, sourceElement });
          break;
        case 'glitchVertical':
          sourceElement = CanvasFilters.glitchVertical({
            widthPx: this.widthPx,
            heightPx: this.heightPx,
            sourceElement,
            sliceSizePx: Math.floor(Math.random() * 50) + 1,
          });
          break;
        case 'glitchHorizontal':
          sourceElement = CanvasFilters.glitchHorizontal({
            widthPx: this.widthPx,
            heightPx: this.heightPx,
            sourceElement,
            sliceSizePx: Math.floor(Math.random() * 50) + 1,
          });
          break;
        case 'centerDuplicateVertical':
          sourceElement = CanvasFilters.centerDuplicate({
            widthPx: this.widthPx,
            heightPx: this.heightPx,
            sourceElement,
            isHorizontal: false,
          });
          break;
        case 'centerDuplicateHorizontal':
          sourceElement = CanvasFilters.centerDuplicate({
            widthPx: this.widthPx,
            heightPx: this.heightPx,
            sourceElement,
            isHorizontal: true,
          });
          break;
        case 'mirror':
          sourceElement = CanvasFilters.mirror({ widthPx: this.widthPx, heightPx: this.heightPx, sourceElement });
          break;
        default:
          break;
      }
    });

    this.canvasContext.drawImage(sourceElement, 0, 0);
  }
}

const main = new Main();
window.addEventListener('DOMContentLoaded', main.onDOMContentLoaded);
