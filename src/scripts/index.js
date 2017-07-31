import 'babel-polyfill'; // アプリ内で1度だけ読み込む エントリーポイントのてっぺん推奨
import $ from 'jquery';
import anime from 'animejs';

class Main {
  constructor() {
    this.onDOMContentLoaded = this.onDOMContentLoaded.bind(this);
  }

  onDOMContentLoaded() {
    this.video = document.querySelector('video');
    this.context = document.querySelector('canvas').getContext('2d');

    setInterval(() => {
      this.context.shadowBlur = 15;//  shadow Blur
      this.context.shadowColor = '#009933'; // shadow color
      this.context.drawImage(this.video, 0, 0);
      this.context.fillStyle = 'rgba(189, 254, 34, 0.3)'; //fill color
      this.context.fillRect(70, 20, 400, 200); //rectangle
    }, 1000 / 10);
  }
}

const main = new Main();
window.addEventListener('DOMContentLoaded', main.onDOMContentLoaded);
