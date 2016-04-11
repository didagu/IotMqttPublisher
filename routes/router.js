var express = require('express');
var router = express.Router();

//invoked for any requests passed to this router
router.use(function(req, res, next) {
  // .. some logic here .. like any other middleware
  next();
});

router.post('/', function(req, res) {
  console.log('sendcmd' + req.body);
  var connection = req.app.get('connection');
  if (connection)
    connection.publish(req.body);
  res.sendStatus(200);
});

router.post('/connect', function(req, res) {
  console.log("connecting");
  var connection = req.app.get('connection');
  if (connection)
    connection.connect();
  res.sendStatus(200);
});

module.exports = router;