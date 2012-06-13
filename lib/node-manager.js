var RedisNode = require('./redis-node')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  ;

function NodeManager(options) {
  EventEmitter.call(this);

  var self = this;
  this.options = {};
  Object.keys(options).forEach(function(k) {
    self.options[k] = options[k];
  });

  this.nodes = [];
  this.options.nodes.forEach(function(spec) {
    var node = new RedisNode(spec);
    node.on('ping', function() {
      if (this.role == 'master') {
        console.log(this.host + ':' + this.port + ' is master!');
      }
    });
    node.on('error', function(err) {
      console.error(err, 'error!');
    });
    self.nodes.push(node);
  });
}
util.inherits(NodeManager, EventEmitter);

module.exports = NodeManager;