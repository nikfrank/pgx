var assert = require('assert');

var env = 'test';
var config = require('./config')[env];

var conop = config.conop;

var schemas = require('./schemas');

var pg = require('pg');
var pgx = require('./pgx')(pg, config.conop, schemas);


var teststatus = '';

// move the test json data to another file and require it

var tdata = require('./testdata');

describe('pgx', function(){

    before(function(done){
	pgx.boot({empty:true}, function(res){
	    //check res?
	    done();
	}, function(err){
	    done(JSON.stringify(err));
	});
    });

// connection tests---------(dep)--------------------------------------------
    describe('connect()', function(){
	it.skip('should connect and not throw errors', function(done){
	    pgx.connect(conop, function(err, client, disconnect) {
		disconnect();
		done(err);
	    });
	});
    });
    describe('boot(empty:true)', function(){
	it.skip('should boot and not throw errors', function(done){
	    pgx.boot({empty:true}, function(){
		done();
	    }, function(err){done(err);});
	});
    });

// need a re-boot test later


//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('insert', function(){
	describe('(stringOnly:true)', function(){
	    it('should make a properly formatted insert string', function(done){
		
		var doc = tdata.palrule;
		var ops = {stringOnly:true};

		pgx.insert('rule', doc.rule, ops, function(err, ruleS){
		    //check the content of the string?
		    done(err||((typeof ruleS !== 'string')?'not a string':undefined));
		});

	    });
	});

	describe('()', function(){
	    it('should return the inserted document', function(done){

		var doc = tdata.palrule;
		var ops = {};

		pgx.insert('rule', doc.rule, ops, function(err, res){
		    //check the res against the doc
		    done(err);
		});
	    });
	});


	describe('()', function(){
	    it('should return the inserted word document', function(done){

		var doc = tdata.testwords[0];
		var ops = {stringOnly:true};
console.log(doc, 'doc');
		pgx.insert('word', doc, ops, function(err, res){
		    //check the res against the doc
		    done(err);
		});
	    });
	});


// this doesn't work for xattrs cols
	describe('(returning:whatever)', function(){
	    it('should return the inserted document', function(done){

		var doc = tdata.pielrule;
		var ops = {returning:[]};// put something here

		pgx.insert('rule', doc.rule, ops, function(err, res){
		    //check the res against the doc
		    done(err);
		});
	    });
	});

	describe('batch(stringOnly)', function(){
	    it('should batch insert records in the db', function(done){
		// insert a bunch of words from the data file

		var docs = tdata.testwords;
		var ops = {stringOnly:true};// put something here

		pgx.batchInsert('word', docs, ops, function(err, res){
		    //check the res against a sql batch insert regexp
		    
//console.log(res.split('conj'));

		    done(err);
		});
	    });
	});

	describe('batch()', function(){
	    it('should batch insert records in the db', function(done){
		// insert a bunch of words from the data file

		var docs = tdata.testwords;
		var ops = {};// put something here

		pgx.batchInsert('word', docs, ops, function(err, res){
		    //check the res against the doc
console.log('res',res);
console.log('err',err);
		    done(err?JSON.stringify(err):null);
		});
	    });
	});

	after(function(){ teststatus = 'insert'; console.log('inserts done');});
    });
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('read', function(){

	before(function(done){
	    var ii; ii = setInterval(function(){
		if(teststatus === 'insert'){
		    clearInterval(ii);
		    console.log('reads started');
		    done();
		}
	    }, 90);
	});

	describe('(stringOnly:true)', function(){
	    it('should make a properly formatted read string', function(done){
		
		pgx.read('rule', {lang:'iw',type:'v'}, {stringOnly:true}, function(err, ruleS){
		    //check the content of the string?
		    done(err||((typeof ruleS !== 'string')?'not a string':undefined));
		});

	    });
	});

	describe('()', function(){
	    it.skip('should read the inserted doc from earlier from the db', function(done){
		//
	    });
	});

	describe('({field:"val"})', function(){
	    it.skip('should find docs matching the field', function(done){
		//
	    });
	});

	describe('({jsonfield:{"key":"val"}})', function(){
	    it.skip('should find docs matching the json->> subfield', function(done){
		//
	    });
	});

	describe('({xfield:"val"})', function(){
	    it.skip('should find docs matching an xattr field', function(done){
		//
	    });
	});

	describe('({returning:["col1","col2"]})', function(){
	    it.skip('should find docs and return only the indicated columns', function(done){
		//
	    });
	});

	describe('({returning:["col1","col2", "xcol"]})', function(){
	    it.skip('should find docs and return only the indicated columns and xattrs', function(done){
		//
	    });
	});

	describe('([schema1, schema2])', function(){
	    it.skip('should conduct a join read of schema1 and schema2 docs', function(done){
		//
	    });
	});

	describe('({limit:3})', function(){
	    it.skip('should find a limited number of docs', function(done){
		pgx.read('rule', {lang:'iw',type:'v'}, {limit:3}, function(err, res){
		    //check length of array
		    done(err);
		});
	    });
	});

	describe('({key:{$in:[val,..]}})', function(){
	    it.skip('should find a doc with key in [val,..]', function(done){
		pgx.read('rule', {lang:'iw',type:{$in:['v','n']}}, {}, function(err, res){
		    //check content of the return
		    done(err);
		});
	    });
	});

	describe('({orderby:{col:"name",order:"asc"}})', function(){
	    it.skip('should find docs and return them sorted', function(done){
		pgx.read('rule', {lang:'iw',type:'v'}, {orderby:{col:"name",order:"asc"}}, function(err, res){
		    //check order of array?
		    done(err);
		});
	    });
	});

	after(function(){ teststatus = 'read'; console.log('reads done');});

    });
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('update', function(){

	before(function(done){
	    var ii; ii = setInterval(function(){
		if(teststatus === 'read'){
		    clearInterval(ii);
		    console.log('updates started');
		    done();
		}
	    }, 90);
	});

	describe('(stringOnly:true)', function(){
	    it.skip('should generate a properly formatted sql string', function(done){
		//
	    });
	});

	describe('()', function(){
	    it('should update a record in the db', function(done){
		done();
	    });
	});

	after(function(){ teststatus = 'update'; console.log('updates done');});
    });
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('erase', function(){

	before(function(done){
	    var ii; ii = setInterval(function(){
		if(teststatus === 'update'){
		    clearInterval(ii);
		    console.log('erasures started');
		    done();
		}
	    }, 90);
	});
	
	describe('()', function(){
	    it.skip('should erase a record from the db', function(done){
		//
	    });
	});

	after(function(){ teststatus = 'erase'; console.log('erasures completed');});

    });
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('schemaVerify()', function(){
	it.skip('should correctly identify valid and invalid schemae', function(done){
	    //
	});
    });
//---------------------------------------------------------------------------
});

