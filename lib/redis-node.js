var redis = require('redis')
  ;

function RedisNode(options) {
  this.host = options.host;
  this.port = new Number(options.port || 6379);
  this.password = options['password'];
}

RedisNode.prototype.isMaster = function(callback) {
  this.getRole(function(role) {
    callback(role == 'master');
  });
};

RedisNode.prototype.isSlave = function(callback) {
  this.isMaster(function(role) {
    callback(!role);
  });
};

RedisNode.prototype.getRole = function(callback) {
  this.fetchInfo(function(serverInfo) {
    callback(serverInfo.role);
  });
};

RedisNode.prototype.fetchInfo = function(callback) {
  this.performOperation(function(serverInfo) {
    callback(serverInfo);
  });
};

RedisNode.prototype.newClient = function() {
  return require('redis').createClient(this.port, this.host);
};

RedisNode.prototype.performOperation = function(callback) {
  var redis = this.newClient();
  redis.on('ready', function() {
    callback(redis.server_info);
  });
  redis.quit();
};

module.exports = RedisNode;