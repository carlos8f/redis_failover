var argv = require('optimist').usage('Usage: $0 [OPTIONS]')
    .alias('n', 'nodes')
    .describe('n', 'Comma-separated redis host:port pairs')
    .alias('z', 'zkservers')
    .describe('z', 'Comma-separated ZooKeeper host:port pairs')
    .describe('znodepath', 'Znode path override for storing Redis server list')
    .describe('max-failures', 'Maximum number of failures before manager marks node as unavailable')
    .alias('h', 'help')
    .describe('h', 'Display all options')
    .argv,
    redis = require('redis'),
    jquery = require('jquery'),
    RedisNode = require('./lib/redisnode').RedisNode;

if (argv.h) {
  require('optimist').showHelp();
}

var DEFAULT_ZNODE_PATH = '/redis_failover_nodes';
var options = {};

// Options processing
if (argv.znodepath) {
  options.znode_path = argv.znodepath;
}

options.nodes = new Array;
argv.n.split(',').forEach(function (val) {
  var parts = val.split(':');
  options.nodes.push({host: parts[0], port: parts[1]});
});

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
exports.NodeManager = NodeManager;

NodeManager.prototype.discoverNodes = function () {
  var nodes = this.unavailable = [];
  this.options.nodes.forEach(function (node) {
    nodes.push(new RedisNode(node));
  });
  this.findMaster(nodes);
}

NodeManager.prototype.findMaster = function(nodes) {
  nodes.forEach(function(node) {
    node.isMaster(function(master) {
      console.log(node.host + ' is a master: ' + master);
    });
  });
}

var nm = new NodeManager(options);
