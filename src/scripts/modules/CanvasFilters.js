// @flow

import sepiaArray from './sepiaArray';

export type Props = {
  widthPx: number,
  heightPx: number,
  sourceElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
};

export type MosaicProps = Props & {
  mosaicPx: number
};

export type GlitchSliceProps = Props & {
  sliceSizePx: number
};

export type CenterDuplicateProps = Props & {
  isHorizontal: boolean
};

const tmpCanvases = {
  mirror: document.createElement('canvas'),
  mosaic: document.createElement('canvas'),
  grayScale: document.createElement('canvas'),
  reverseColor: document.createElement('canvas'),
  bitmap: document.createElement('canvas'),
  sepia: document.createElement('canvas'),
  glitchHorizontal: document.createElement('canvas'),
  glitchVertical: document.createElement('canvas'),
  centerDuplicateHorizontal: document.createElement('canvas'),
  centerDuplicateVertical: document.createElement('canvas'),
};
Object.freeze(tmpCanvases);

function getRandom({ min, max }) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function mirror({ widthPx, heightPx, sourceElement }: Props): HTMLCanvasElement {
  tmpCanvases.mirror.width = widthPx;
  tmpCanvases.mirror.height = heightPx;
  const tmpContext = tmpCanvases.mirror.getContext('2d');
  const reverseCanvas = document.createElement('canvas');

  reverseCanvas.width = widthPx;
  reverseCanvas.height = heightPx;
  const reverseContext = reverseCanvas.getContext('2d');
  reverseContext.translate(widthPx, 0); // ひっくり返すので、その分移動する
  reverseContext.scale(-1, 1);
  reverseContext.drawImage(sourceElement, 0, 0, widthPx, heightPx, 0, 0, widthPx, heightPx);
  tmpContext.drawImage(reverseCanvas, 0, 0, widthPx, heightPx, 0, 0, widthPx, heightPx);

  return tmpCanvases.mirror;
}


// 参考: https://www.ipentec.com/document/document.aspx?page=html-canvas-create-mosic-image
export function mosaic({ widthPx, heightPx, sourceElement, mosaicPx }: MosaicProps): HTMLCanvasElement {
  tmpCanvases.mosaic.width = widthPx;
  tmpCanvases.mosaic.height = heightPx;
  const tmpContext = tmpCanvases.mosaic.getContext('2d');
  tmpContext.drawImage(sourceElement, 0, 0, widthPx, heightPx, 0, 0, widthPx, heightPx);

  // filter
  const imageData = tmpContext.getImageData(0, 0, widthPx, heightPx);
  for (let y = 0; y < heightPx; y += mosaicPx) {
    for (let x = 0; x < widthPx; x += mosaicPx) {
      const dataBaseIndex = ((y * widthPx) + x) * 4;
      // imageData.dataには1px毎のデータがrgba順の10進数で入っている
      const r = imageData.data[dataBaseIndex];
      const g = imageData.data[dataBaseIndex + 1];
      const b = imageData.data[dataBaseIndex + 2];

      tmpContext.fillStyle = `rgb(${r},${g},${b})`;
      tmpContext.fillRect(x, y, x + mosaicPx, y + mosaicPx);
    }
  }

  return tmpCanvases.mosaic;
}

export function grayScale({ widthPx, heightPx, sourceElement }: Props): HTMLCanvasElement {
  tmpCanvases.grayScale.width = widthPx;
  tmpCanvases.grayScale.height = heightPx;
  const tmpContext = tmpCanvases.grayScale.getContext('2d');
  tmpContext.drawImage(sourceElement, 0, 0, widthPx, heightPx, 0, 0, widthPx, heightPx);
  const imageData = tmpContext.getImageData(0, 0, widthPx, heightPx);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (0.34 * data[i]) + (0.5 * data[i + 1]) + (0.16 * data[i + 2]);
    data[i] = brightness;
    data[i + 1] = brightness;
    data[i + 2] = brightness;
  }

  tmpContext.putImageData(imageData, 0, 0);
  return tmpCanvases.grayScale;
}

export function reverseColor({ widthPx, heightPx, sourceElement }: Props): HTMLCanvasElement {
  tmpCanvases.reverseColor.width = widthPx;
  tmpCanvases.reverseColor.height = heightPx;
  const tmpContext = tmpCanvases.reverseColor.getContext('2d');
  tmpContext.drawImage(sourceElement, 0, 0, widthPx, heightPx, 0, 0, widthPx, heightPx);
  const imageData = tmpContext.getImageData(0, 0, widthPx, heightPx);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }

  tmpContext.putImageData(imageData, 0, 0);
  return tmpCanvases.reverseColor;
}

export function bitmap({ widthPx, heightPx, sourceElement }: Props): HTMLCanvasElement {
  tmpCanvases.bitmap.width = widthPx;
  tmpCanvases.bitmap.height = heightPx;
  const tmpContext = tmpCanvases.bitmap.getContext('2d');
  tmpContext.drawImage(sourceElement, 0, 0, widthPx, heightPx, 0, 0, widthPx, heightPx);
  const imageData = tmpContext.getImageData(0, 0, widthPx, heightPx);
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

  tmpContext.putImageData(imageData, 0, 0);
  return tmpCanvases.bitmap;
}

export function sepia({ widthPx, heightPx, sourceElement }: Props): HTMLCanvasElement {
  tmpCanvases.sepia.width = widthPx;
  tmpCanvases.sepia.height = heightPx;
  const tmpContext = tmpCanvases.sepia.getContext('2d');
  tmpContext.drawImage(sourceElement, 0, 0, widthPx, heightPx, 0, 0, widthPx, heightPx);
  const imageData = tmpContext.getImageData(0, 0, widthPx, heightPx);
  const { data } = imageData;
  let noise = 20;

  for (let i = 0; i < data.length; i += 4) {
    noise = Math.round(noise - (Math.random() * noise));
    data[i] = sepiaArray.r[data[i]];
    data[i + 1] = sepiaArray.g[data[i + 1]];
    data[i + 2] = sepiaArray.b[data[i + 2]];

    for (let j = 0; j < 3; j += 1) {
      const iPN = noise + data[i + j];
      data[i + j] = (iPN > 255) ? 255 : iPN;
    }
  }

  tmpContext.putImageData(imageData, 0, 0);
  return tmpCanvases.sepia;
}

export function glitchLine({ widthPx, heightPx, sourceElement }: GlitchSliceProps): HTMLCanvasElement {
  tmpCanvases.sepia.width = widthPx;
  tmpCanvases.sepia.height = heightPx;
  const tmpContext = tmpCanvases.sepia.getContext('2d');
  tmpContext.drawImage(sourceElement, 0, 0, widthPx, heightPx, 0, 0, widthPx, heightPx);
  const imageData = tmpContext.getImageData(0, 0, widthPx, heightPx);
  const { data } = imageData;

  const randR = Math.floor(Math.random() * 5) * 2;
  const randG = Math.floor(Math.random() * 5) * 2;
  const randB = Math.floor(Math.random() * 5);
  for (let i = 0, l = data.length; i < l; i += 4) {
    data[i * 4] = data[(i + randR) * 4];
    data[(i * 4) + 1] = data[((i + randG) * 4) + 1];
    data[(i * 4) + 2] = data[((i + randB) * 4) + 2];
  }

  tmpContext.putImageData(imageData, 0, 0);
  return tmpCanvases.sepia;
}

export function glitchHorizontal({ widthPx, heightPx, sourceElement, sliceSizePx }: GlitchSliceProps): HTMLCanvasElement {
  tmpCanvases.glitchHorizontal.width = widthPx;
  tmpCanvases.glitchHorizontal.height = heightPx;
  const tmpContext = tmpCanvases.glitchHorizontal.getContext('2d');
  const verticalSlices = Math.round(heightPx / sliceSizePx);

  for (let i = 0; i < verticalSlices; i += 1) {
    const horizOffset = getRandom({ max: -Math.abs(sliceSizePx), min: sliceSizePx });
    tmpContext.drawImage(sourceElement,
      0,
      i * verticalSlices,
      widthPx,
      (i * verticalSlices) + verticalSlices,
      horizOffset,
      i * verticalSlices,
      widthPx,
      (i * verticalSlices) + verticalSlices,
    );
  }

  return tmpCanvases.glitchHorizontal;
}

export function glitchVertical({ widthPx, heightPx, sourceElement, sliceSizePx }: GlitchSliceProps): HTMLCanvasElement {
  tmpCanvases.glitchVertical.width = widthPx;
  tmpCanvases.glitchVertical.height = heightPx;
  const tmpContext = tmpCanvases.glitchVertical.getContext('2d');
  const horizontalSlices = Math.round(widthPx / sliceSizePx);

  for (let i = 0; i < horizontalSlices; i += 1) {
    const horizOffset = getRandom({ max: -Math.abs(sliceSizePx), min: sliceSizePx });
    tmpContext.drawImage(sourceElement,
      i * horizontalSlices,
      0,
      (i * horizontalSlices) + horizontalSlices,
      heightPx,
      i * horizontalSlices,
      horizOffset,
      (i * horizontalSlices) + horizontalSlices,
      heightPx,
    );
  }

  return tmpCanvases.glitchVertical;
}

function centerDuplicateHorizontal({ widthPx, heightPx, sourceElement }: Props): HTMLCanvasElement {
  tmpCanvases.centerDuplicateHorizontal.width = widthPx;
  tmpCanvases.centerDuplicateHorizontal.height = heightPx;
  const tmpContext = tmpCanvases.centerDuplicateHorizontal.getContext('2d');
  const reverseCanvas = document.createElement('canvas');

  const centerWidthPx = widthPx / 2;
  tmpContext.drawImage(sourceElement, 0, 0, centerWidthPx, heightPx, 0, 0, centerWidthPx, heightPx);

  reverseCanvas.width = centerWidthPx;
  reverseCanvas.height = heightPx;
  const reverseContext = reverseCanvas.getContext('2d');
  reverseContext.translate(centerWidthPx, 0); // ひっくり返すので、その分移動する
  reverseContext.scale(-1, 1);
  reverseContext.drawImage(sourceElement, 0, 0, centerWidthPx, heightPx, 0, 0, centerWidthPx, heightPx);
  tmpContext.drawImage(reverseCanvas, 0, 0, centerWidthPx, heightPx, centerWidthPx, 0, centerWidthPx, heightPx);

  return tmpCanvases.centerDuplicateHorizontal;
}

function centerDuplicateVertical({ widthPx, heightPx, sourceElement }: Props): HTMLCanvasElement {
  tmpCanvases.centerDuplicateVertical.width = widthPx;
  tmpCanvases.centerDuplicateVertical.height = heightPx;
  const tmpContext = tmpCanvases.centerDuplicateVertical.getContext('2d');
  const reverseCanvas = document.createElement('canvas');

  const centerHeightPx = heightPx / 2;
  tmpContext.drawImage(sourceElement, 0, 0, widthPx, centerHeightPx, 0, 0, widthPx, centerHeightPx);

  reverseCanvas.width = widthPx;
  reverseCanvas.height = centerHeightPx;
  const reverseContext = reverseCanvas.getContext('2d');
  reverseContext.translate(0, centerHeightPx); // ひっくり返すので、その分移動する
  reverseContext.scale(1, -1);
  reverseContext.drawImage(sourceElement, 0, 0, widthPx, centerHeightPx, 0, 0, widthPx, centerHeightPx);
  tmpContext.drawImage(reverseCanvas, 0, 0, widthPx, centerHeightPx, 0, centerHeightPx, widthPx, centerHeightPx);

  return tmpCanvases.centerDuplicateVertical;
}

export function centerDuplicate(props: CenterDuplicateProps): HTMLCanvasElement {
  return props.isHorizontal ? centerDuplicateHorizontal(props) : centerDuplicateVertical(props);
}
