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

    describe('boot()', function(){
	it.skip('should boot and not throw errors', function(done){
	    
	    pgx.boot({}, function(){
		done();
	    }, function(err) {
		done(err);
	    });
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
	it.skip('should read a bunch of docs from the db', function(){
	    //
	});
    });

    describe('read({field:"val"})', function(){
	it.skip('should find docs matching the field', function(){
	    //
	});
    });

    describe('read({jsonfield:{"key":"val"}})', function(){
	it.skip('should find docs matching the json->> subfield', function(){
	    //
	});
    });

    describe('read({xfield:"val"})', function(){
	it.skip('should find docs matching an xattr field', function(){
	    //
	});
    });

});

// need tests for:

// schema verify

// stringbuilding reads, inserts, upserts
// json depth reads

// boot process

// selective read
