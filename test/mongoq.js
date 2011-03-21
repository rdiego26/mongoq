var assert = require("assert");
var db = require("mongoq");
var testdb = db("testdb");
var col = testdb.collection("col");
//equal ok notEqual deepEqual
//['insert', 'remove', 'rename', 'insertAll', 'save', 'update', 'distinct', 'count', 'drop', 'findAndModify', 'find', 'findOne', 'createIndex', 'ensureIndex', 'indexInformation', 'dropIndex', 'dropIndexes', 'mapReduce', 'group']
col.insert({"init": true}, function(err, doc) {
	assert.strictEqual(err, null);
	assert.strictEqual(doc[0]["init"], true);
	col.drop(function(err) {
		assert.strictEqual(err, null);
		//testdb.close();
		var data = [{'name':'William Shakespeare', 'email':'william@shakespeare.com', 'age':587},{'name':'Jorge Luis Borges', 'email':'jorge@borges.com', 'age': 587}];
		col.insert(data, function(err, doc) {
			col.findItems({}, function(err, doc){
				assert.equal(doc.length, 2);
				col.update({age: 587}, {"$set":{update:true}}, {upsert: true, multi: true, safe: true}, function(err, doc) {
					//don't need to return the document
					assert.strictEqual(err, null);
					testdb.close();
					console.log("Test ok");
				});
			});
		});
	});
});