var RedisNode = require('./redis-node')
  ;

function NodeManager(options) {
  var self = this;
  self.options = {};
  Object.keys(options).forEach(function(k) {
    self.options[k] = options[k];
  });

  this.znode = options['znode_path'] || DEFAULT_ZNODE_PATH;
  this.queue = [];
  this.discoverNodes();
}

NodeManager.prototype.discoverNodes = function () {
  var nodes = this.unavailable = [];
  this.options.nodes.forEach(function (node) {
    nodes.push(new RedisNode(node));
  });
  this.findMaster(nodes);
};

NodeManager.prototype.findMaster = function(nodes) {
  nodes.forEach(function(node) {
    node.isMaster(function(master) {
      console.log(node.host + ' is a master: ' + master);
    });
  });
};

module.exports = NodeManager;