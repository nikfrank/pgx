var assert = require('assert');

var env = 'test';
var config = require('./config')[env];

var conop = config.conop;

var schemas = require('./schemas');

var pg = require('pg');
var pgx = require('./pgx')(pg, config.conop, schemas);

describe('pgx', function(){
    describe('connect()', function(){
	it('should connect and not throw errors', function(done){
	    pgx.connect(conop, function(err, client, disconnect) {
		disconnect();
		done(err);
	    });
	});
    });

    describe('boot(empty:true)', function(){
	it('should boot and not throw errors', function(done){
	    pgx.boot({empty:true}, function(){
		done();
	    }, function(err){done(err);});
	});
    });

    describe('insert(stringOnly:true)', function(){
	it('should make a properly formatted insert string', function(done){
	    
	    var doc = {"rule":
		       {"name":"פעל","lang":"iw","type":"v","grp":"פעל",
			"conj":{"inf":"ל12ו3",
				"past":{
				    "ms":["","",""],"ns":["","",""],"fs":["","",""],
				    "mp":["","",""],"np":["","",""],"fp":["","",""]
				},
				"present":{
				    "ms":["","","1ו23"],"ns":["","",""],"fs":["","","1ו23ת"],
				    "mp":["","","1ו23ים"],"np":["","",""],"fp":["","","1ו23ות"]
				},
				"future":{
				    "ms":["","",""],"ns":["","",""],"fs":["","",""],
				    "mp":["","",""],"np":["","",""],"fp":["","",""]
				},
				"imperative":{
				    "ms":["","",""],"ns":["","",""],"fs":["","",""],
				    "mp":["","",""],"np":["","",""],"fp":["","",""]
				}
			       },
			"hasconj":{
			    "inf":true,
			    "past":{
				"ms":[true,true,true],"ns":[true,true,true],"fs":[true,true,true],
				"mp":[true,true,true],"np":[true,true,true],"fp":[true,true,true]
			    },
			    "present":{
				"ms":[false,false,true],"ns":[false,false,false],
				"fs":[false,false,true],"mp":[false,false,true],
				"np":[false,false,false],"fp":[false,false,true]
			    },
			    "future":{
				"ms":[true,true,true],"ns":[true,true,true],"fs":[true,true,true],
				"mp":[true,true,true],"np":[true,true,true],"fp":[true,true,true]
			    },
			    "imperative":{
				"ms":[true,true,true],"ns":[true,true,true],"fs":[true,true,true],
				"mp":[true,true,true],"np":[true,true,true],"fp":[true,true,true]
			    }
			},"transform":[],"exps":[]
		       }
		      };

	    var ops = {stringOnly:true};

	    pgx.insert('rule', doc.rule, ops, function(err, ruleS){
//actually check the string
		done(err);
	    });

	});
    });

    describe('insert()', function(){
	it('should return the inserted document', function(done){

	    var doc = {"rule":
		       {"name":"פעל","lang":"iw","type":"v","grp":"פעל",
			"conj":{"inf":"ל12ו3",
				"past":{
				    "ms":["","",""],"ns":["","",""],"fs":["","",""],
				    "mp":["","",""],"np":["","",""],"fp":["","",""]
				},
				"present":{
				    "ms":["","","1ו23"],"ns":["","",""],"fs":["","","1ו23ת"],
				    "mp":["","","1ו23ים"],"np":["","",""],"fp":["","","1ו23ות"]
				},
				"future":{
				    "ms":["","",""],"ns":["","",""],"fs":["","",""],
				    "mp":["","",""],"np":["","",""],"fp":["","",""]
				},
				"imperative":{
				    "ms":["","",""],"ns":["","",""],"fs":["","",""],
				    "mp":["","",""],"np":["","",""],"fp":["","",""]
				}
			       },
			"hasconj":{
			    "inf":true,
			    "past":{
				"ms":[true,true,true],"ns":[true,true,true],"fs":[true,true,true],
				"mp":[true,true,true],"np":[true,true,true],"fp":[true,true,true]
			    },
			    "present":{
				"ms":[false,false,true],"ns":[false,false,false],
				"fs":[false,false,true],"mp":[false,false,true],
				"np":[false,false,false],"fp":[false,false,true]
			    },
			    "future":{
				"ms":[true,true,true],"ns":[true,true,true],"fs":[true,true,true],
				"mp":[true,true,true],"np":[true,true,true],"fp":[true,true,true]
			    },
			    "imperative":{
				"ms":[true,true,true],"ns":[true,true,true],"fs":[true,true,true],
				"mp":[true,true,true],"np":[true,true,true],"fp":[true,true,true]
			    }
			},"transform":[],"exps":[]
		       }
		      };	    

	    var ops = {};

	    pgx.insert('rule', doc.rule, ops, function(err, res){
//check the res against the doc
		done(err);
	    });

	});
    });

    describe('read(stringOnly:true)', function(){
	it('should make a properly formatted insert string', function(done){
	    
	    pgx.read('rule', {lang:'iw',type:'v'}, {stringOnly:true}, function(err, ruleS){
		console.log(ruleS);
//actually check the string
		done(err);
	    });

	});
    });

    describe('read()', function(){
	it.skip('should read the inserted doc from earlier from the db', function(done){
	    //
	});
    });

    describe('read({field:"val"})', function(){
	it.skip('should find docs matching the field', function(done){
	    //
	});
    });

    describe('read({jsonfield:{"key":"val"}})', function(){
	it.skip('should find docs matching the json->> subfield', function(done){
	    //
	});
    });

    describe('read({xfield:"val"})', function(){
	it.skip('should find docs matching an xattr field', function(done){
	    //
	});
    });

    describe('batchInsert()', function(){
	it.skip('should batch insert records in the db', function(done){
	    //
	});
    });

    describe('read({returning:["col1","col2"]})', function(){
	it.skip('should find docs and return only the indicated columns', function(done){
	    //
	});
    });

    describe('read({returning:["col1","col2", "xcol"]})', function(){
	it.skip('should find docs and return only the indicated columns and xattrs', function(done){
	    //
	});
    });

    describe('read([schema1, schema2])', function(){
	it.skip('should conduct a join read of schema1 and schema2 docs', function(done){
	    //
	});
    });

    describe('read({limit:3})', function(){
	it.skip('should find a limited number of docs', function(done){
	    //
	});
    });

    describe('read({sortBy:"name"})', function(){
	it.skip('should find docs and return them sorted', function(done){
	    //
	});
    });

    describe('update(stringOnly:true)', function(){
	it.skip('should generate a properly formatted sql string', function(done){
	    //
	});
    });

    describe('update()', function(){
	it.skip('should update a record in the db', function(done){
	    //
	});
    });

    describe('erase()', function(){
	it.skip('should erase a record from the db', function(done){
	    //
	});
    });

    describe('schemaVerify()', function(){
	it.skip('should correctly identify valid and invalid schemae', function(done){
	    //
	});
    });
});


function gendoc(schema){
    // generate a random doc from the schema... there might be a plugin for this
}
