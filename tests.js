var assert = require('assert');

var env = 'test';
var config = require('./config')[env];

var conop = config.conop;

var schemas = require('./schemas');

var pg = require('pg');
var pgx = require('./pgwrap')(pg, config.conop, schemas);

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

describe('pgx', function(){
    describe('connect()', function(){
	it('should connect and not throw errors', function(done){
	    
	    pgx.connect(conop, function(err, client, disconnect) {
		disconnect();
		finish(err);
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
	it('should make a properly formatted insert string', function(){
	    
	    var doc = {};
	    var ops = {};

	    pgx.insert('rule', doc, ops, function(err, res){
		//
	    });

	});
    });

    describe('insert()', function(){
	it('should return the inserted document', function(){
	    
	    var doc = {};
	    var ops = {};

	    pgx.insert('rule', doc, ops, function(err, res){
		//
	    });

	});
    });

    describe('read(stringOnly:true)', function(){
	it('should make a properly formatted insert string', function(){
	    //
	});
    });

    describe('read()', function(){
	it('should read a bunch of docs from the db', function(){
	    //
	});
    });

    describe('read({field:"val"})', function(){
	it('should find docs matching the field', function(){
	    //
	});
    });

    describe('read({jsonfield:{"key":"val"}})', function(){
	it('should find docs matching the json->> subfield', function(){
	    //
	});
    });

    describe('read({xfield:"val"})', function(){
	it('should find docs matching an xattr field', function(){
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
