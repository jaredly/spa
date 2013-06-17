
var Tip = require('tip')
  , request = require('superagent')
  , tip = new Tip('english');
var showTip = function (node, eng) {
  tip.message(eng).show(node);
};

var $ = document.querySelectorAll.bind(document)
  , $o = document.querySelector.bind(document)
  , trans = document.getElementById('translationbox')
  , BASEURL = 'http://www.spanishdict.com/translate/';

var getWord = function (word) {
  // iframe.src = BASEURL + word;
  request.get('/api/full')
    .query({text: word})
    .end(function(res){
      trans.innerHTML = res.text;
    });
};

var clean = function(word) {
  return escape(word.replace(/^[.,;'"]+/, '').replace(/[.,;'"]+$/, ''));
};
var good = function (node) {
  return node.tagName == 'SPAN' && node.parentNode.className == 'spanish';
};

var over = {};
var makeDivs = function () {
  var spa = [].slice.call($('p.spanish'));
  spa.forEach(function (p) {
    var t = p.innerHTML.split(' ');
    var body = t.map(function(word) {
      return '<span data-word="' + clean(word) + '">' + word + '</span>';
    }).join(' ');
    p.innerHTML = body;
  });
  var content = document.getElementById('content');
  content.addEventListener('click', function(e) {
    var node = e.target;
    if (good(node)) {
      text = unescape(node.getAttribute('data-word'));
      getWord(text);
    }
  });
  content.addEventListener('mouseover', function (e) {
    var node = e.target;
    if (good(node)) {
      var word = unescape(node.getAttribute('data-word'));
      lookUpWord(node, word);
    }
  });
  content.addEventListener('mouseout', function (e) {
    var node = e.target;
    if (over[node]) over[node] = false;
  });
};

var lookUpWord = function (node, word, dontwait) {
  if (!hasWord(word, showTip.bind(null, node))) {
    if (!dontwait) {
      over[node] = true;
      setTimeout(showWord.bind(null, node, word), 200);
    } else {
      showWord(node, word, true);
    }
  }
};

var showWord = function(node, word, dontwait) {
  if (!dontwait && !over[node]) {
    console.log('abc ' + word);
    return;
  }
  quickWord(word, function (eng) {
    if (!dontwait && !over[node]){
      console.log('nope' + word);
      return;
    }
    showTip(node, eng);
  });
};

var ctr = 1;
var TRLINK = 'http://translate1.spanishdict.com/dictionary/translation_prompt?lang_from=es&trtext=';
var trlink = function (word, callback) {
  return TRLINK + word + '&callback=' + callback;
};

var hasWord = function (word, next) {
  if (localStorage[word]) {
    next(localStorage[word]);
    return true;
  }
  return false;
};

var quickWord = function (word, next) {
  ctr += 1;
  var myctr = ctr;
  var script = document.createElement('script');
  script.src = trlink(word, 'got' + ctr);
  window['got' + ctr] = function (options) {
    localStorage[options.query] = options.results;
    next(options.results);
    script.parentNode.removeChild(script);
    window['got' + myctr] = null;
  };
  document.body.appendChild(script);
};

makeDivs();

document.body.addEventListener('mouseup', function () {
  var s = document.getSelection();
  if (s.type !== 'Range') return;
  var text = s.toString();
  lookUpWord(s.anchorNode.parentNode, text, true);
});
