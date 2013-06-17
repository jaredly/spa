
var express = require('express')
  , app = express()
  , request = require('superagent');

var mcache = {};

app.use(express.static(__dirname + '/static'));
app.get('/api/full', function(req, res) {
  var words = req.query.text.trim();
  console.log('looking up ' + words);
  if (words in mcache) {
    return res.send(mcache[words]);
  }
  request.get('http://www.spanishdict.com/translate/' + req.query.text)
   .end(function(err, data) {
     if (err) {
       return res.send('Error');
     }
     var text = data.text
       , start = text.indexOf('<p><div class="LV0">')
       , end = text.indexOf('HarperCollins Publishers 2011</a></p>', start)
       , full;
     if (start === -1) {
       full = 'No translation found';
     } else {
       console.log('yes', start, end);
       full = text.slice(start, end) + '</a></p>';
     }
     mcache[words] = full;
     res.send(full);
   });
});

app.listen(3000);
console.log('listening');

