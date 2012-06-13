var redis = require('redis')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  ;

function RedisNode(options) {
  this.host = options.host || 'localhost';
  this.port = parseInt(options.port || 6379);
  this.role = false;
  this.up = false;
  this.pingInterval = options.pingInterval || 1000;
  this.enabled = typeof options.enabled == 'undefined' ? true : options.enabled;

  this.ping();
}
util.inherits(RedisNode, EventEmitter);

RedisNode.prototype.ping = function() {
  if (!this.enabled) {
    return;
  }
  var self = this;
  var client = redis.createClient(this.port, this.host);
  client.on('ready', function() {
    self.role = client.server_info.role;
    self.up = true;
    self.emit('ping');
    client.quit();

    setTimeout(function() {
      self.ping();
    }, self.pingInterval);
  });
  client.on('error', function(err) {
    try {
      client.quit();
    }
    catch (e) {
      // Ignore further errors
    }
    self.up = false;
    self.master = false;
    self.emit('error', err);

    setTimeout(function() {
      self.ping();
    }, self.pingInterval);
  });
};

module.exports = RedisNode;