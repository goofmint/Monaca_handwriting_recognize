const APIKEY = 'YOUR_APIKEY';
const URL = 'https://api.apigw.smt.docomo.ne.jp/puxImageRecognition/v1/rakuhira?APIKEY=' + APIKEY;

$(function() {
  // キャンバスを用意
  let points = [];
  let stroke = 0;
  const canvas = document.querySelector("canvas");
  const event = typeof cordova === 'undefined' ? 'mousemove' : 'touchmove';
  const signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(200, 200, 200)',
    onBegin: function(e) {
      // 描画を開始したらイベントを購読
      $('canvas').on(event, addPoint);
    },
    onEnd: function(e) {
      // 描画が終わったらストロークを一つインクリメントしつつイベント購読を終了
      stroke += 1;
      $('canvas').off(event, addPoint);
    }
  });
  
  // Canvasの大きさを調整
  var ratio =  Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
  signaturePad.clear();
  
  // タップした箇所をストロークとして保存しておく
  let addPoint = function(e) {
    const {x, y} = typeof cordova === 'undefined' ? 
      {x: e.clientX, y: e.clientY} :
      {x: e.originalEvent.targetTouches[0].clientX, y: e.originalEvent.targetTouches[0].clientY};
    const point = signaturePad._createPoint(x, y);
    if (!points[stroke]) points[stroke] = [];
    points[stroke].push(`(${point.x},${point.y})`);
  }
  
// クリアボタンを押した時の処理
  $("#clear").on('click', function(e) {
    points = [];
    stroke = 0;
    signaturePad.clear();
  });
  
  // 認識処理
  $("#recognize").on('click', function(e) {
    // ストロークを文字列に展開します
    let coordinatePointArray = '{' + points.join('},{') + '}';
    // リクエストパラメータ
    const params = {
      engineMode: 'RAPID',
      frameSizeWidth: 300,
      frameSizeHeight: 300,
      coordinatePointArray: coordinatePointArray,
      response: 'json'
    };
    $.ajax({
      url: URL,
      type: 'post',
      data: params
    })
    .then(function(data) {
      // 返ってきた候補の文字列を取得します
      // 文字コードになっているので文字列に戻します
      const ary = data.results.handwritingRecognition.recognitionResultList.recognitionResult;
      let words = ary.map(function(code) {
        return String.fromCharCode(code);
      });
      // 一番最初の候補を表示
      const val = $('#result').val();
      $('#result').val(val + words[0]);
      
      // Canvasをクリア
      $('#clear').click();
    })
  });
  
});
