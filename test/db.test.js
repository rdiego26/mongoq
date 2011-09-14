
var mongoq = require('mongoq')
, should = require('should');

module.exports = {
	"test db arguments": function(){
		var db = mongoq("mongodb:\/\/fred:foobar@localhost:27017,localhost:27018/mongoqTest?reconnectWait=2000;retries=20");
		var options = db.options;
		options.should.be.a('object');
		options.username.should.eql("fred");
		options.password.should.eql("foobar");
		db.name.should.eql("mongoqTest");

		var server = db.server
		, servers = server.servers;
		servers.should.have.length( 2 );
		var server1 = servers[ 0 ]
		, server2 = servers[ 1 ];
		server.reconnectWait.should.equal(2000);
		server.retries.should.equal(20);
		server1.host.should.eql("localhost");
		server1.port.should.eql("27017");
		server1.autoReconnect.should.be.false;
		server1.poolSize.should.equal(1);

		server2.host.should.eql("localhost");
		server2.port.should.eql("27018");

		db = mongoq("mongodb:\/\/127.0.0.1:27018/mongoqTest?auto_reconnect&poolSize=2");
		options = db.options;
		options.should.be.a('object');
		should.strictEqual(options.username, undefined);

		server = db.server;
		server.autoReconnect.should.be.true;
		server.poolSize.should.equal( 2 );
		server.host.should.equal("127.0.0.1");
		server.port.should.eql("27018");

		db = mongoq("mongodb:\/\/127.0.0.1:27018/mongoqTest?auto_reconnect=false");
		options = db.options;
		options.should.be.a('object');
		server = db.server;
		server.autoReconnect.should.be.false;

		db = mongoq("mongoqTest", {auto_reconnect: true});
		options = db.options;
		options.should.be.a('object');
		should.strictEqual(options.username, undefined);

		server = db.server;
		server.poolSize.should.equal( 1 );

		server.host.should.equal("localhost");
		server.port.should.eql("27017");
		server.autoReconnect.should.be.true;
		db.name.should.eql("mongoqTest");

		db = mongoq("mongoqTest", {auto_reconnect: true, host: "127.0.0.1", port: "1233"});
		server = db.server;
		server.host.should.equal("127.0.0.1");
		server.port.should.eql("1233");
	}

	, "test db events[error,close,timeout]": function(beforeExit) {
		var db = mongoq("mongoqTest")
		, db2 = mongoq("mongodb:\/\/127.0.0.1:27019/mongoqTest")
		, dbopen = false
		, db2open = false
		, close = false
		, error = false;
		db.on("close", function() {
			close = true;
		});
		db.open(function(err, originalDb) {
			dbopen = true;
			should.exist(originalDb);
			should.equal(err, null);
			db.close();
		});
		db2.on("error", function() {
			error = true;
		});
		db2.open(function(err) {
			db2open = true;
			err.should.be.an.instanceof(Error);
		});
		beforeExit(function() {
			should.strictEqual(dbopen, true);
			should.strictEqual(db2open, true);
			should.strictEqual(close, true);
			should.strictEqual(error, true);
		});
	}
	, "test db close": function(beforeExit) {
		var db = mongoq("mongoqTest")
		, hadOpen = false
		, hadClose = false;
		db.open(function(err, originalDb) {
			hadOpen = true;
			should.exist(originalDb);
			should.equal(err, null);

		});
		db.close(function() {
			hadClose = true;
		});
		beforeExit(function() {
			should.strictEqual(hadOpen, true);
			should.strictEqual(hadClose, true);
		});
	}
	, "test db inherit methods": function(beforeExit) {
		var db = mongoq("mongoqTest")
		hadOpen = false;
		db.dropCollection("test", function(err, success) {
			db.createCollection("test", function(err, collection) {
				should.equal(err, null);
				should.exist(collection);
				db.collectionNames(function(err, ar) {
					hadOpen = true;
					ar.should.be.instanceof( Array );
					ar.length.should.be.above( 1 );
					var hasCollectionTest = false;
					ar.forEach(function(col) {
						if( col.name == "mongoqTest.test" ) hasCollectionTest = true;
					});
					hasCollectionTest.should.be.true;
					db.close();
				});
			});
		});
		beforeExit(function() {
			should.strictEqual(hadOpen, true);
		});
	}
};
