var assert = require('assert');

var env = 'test';
var config = require('./pconfig')[env];

var conop = config.conop;

var schemas = require('./pschemas');

var pg = require('pg');
var pgx = require('./pgx')(pg, config.conop, schemas);


var teststatus = '';

var tdata = require('./jdata');

var fs = require('fs');
var stringRes = {};

// refactor these for the jdata
// try to keep the tests lined up with jtests

describe('pgx', function(){

    before(function(done){
	pgx.boot({empty:true}, function(res){
	    //check res?
	    done();
	}, function(err){
	    done(JSON.stringify(err));
	});
    });

    after(function(done){
	fs.writeFile("./pStringRes.json", JSON.stringify(stringRes), function(err){
	    if(err) return done(err);
	    console.log("The file was saved!");
	    done();
	}); 
    });

//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('insert', function(){
	
	describe('(stringOnly:true)', function(){it('ins string correct', function(done){
	    var doc = tdata.person[0]; var ops = {stringOnly:true};
	    pgx.insert('person', doc, ops, function(err, insS){
		if(typeof insS !== 'string') done('not string: '+JSON.stringify(insS));
		else stringRes['insert'] = [insS, done(err)][0];
	    });
	});});				   
	describe('()', function(){ it('should return the inserted document', function(done){
	    var doc = tdata.person[0]; var ops = {};
	    
	    pgx.insert('person', doc, ops, function(err, res){
		//check the res against the doc
		done(err?JSON.stringify(err):undefined);
	    });
	});});

	describe('(returning:[], stringOnly:true)', function(){it('insRet string correct', function(done){
	    var doc = tdata.person[1]; var ops = {returning:['person_hash', 'country'], stringOnly:true};
	    pgx.insert('person', doc, ops, function(err, insS){
		if(typeof insS !== 'string') done('not string: '+JSON.stringify(insS));
		else stringRes['insertReturning'] = [insS, done(err)][0];
	    });
	});});
	describe('(returning:[])', function(){it('should return the reqd fields', function(done){
	    var doc = tdata.person[1]; var ops = {returning:['person_hash', 'country']};

	    pgx.insert('person', doc, ops, function(err, res){
		//check the res against the fields map doc
		done(err?JSON.stringify(err):undefined);
	    });
	});});

	describe('(returning:[xattr], stringOnly:true)', function(){it('insRetX string correct', function(done){
	    var doc = tdata.person[2]; var ops = {returning:['person_hash', 'mainlang']};
	    pgx.insert('person', doc, ops, function(err, insS){
		if(typeof insS !== 'string') done('not string: '+JSON.stringify(insS));
		else stringRes['insertReturningXattr'] = [insS, done(err)][0];
	    });
	});});
	describe('(returning:[xattr])', function(){it('should return the reqd fields + xattr', function(done){
	    var doc = tdata.person[2]; var ops = {returning:['person_hash', 'mainlang']};

	    pgx.insert('person', doc, ops, function(err, res){
		//check the res against the fields map doc
		done(err?JSON.stringify(err):undefined);
	    });
	});});

// this doesn't work for xattrs cols
	describe('(returning:[invalidXattr])', function(){it('should return the reqd xattr as null?', function(done){
	    var doc = tdata.person[2]; var ops = {returning:['person_hash', 'lang']};

	    pgx.insert('person', doc, ops, function(err, res){
		//check the res against the fields map doc
		done(err?JSON.stringify(err):undefined);
	    });
	});});
//
//

	describe('batch(stringOnly)', function(){it('insBatch string', function(done){
	    var docs = tdata.shool; var ops = {stringOnly:true};

	    pgx.batchInsert('school', docs, ops, function(err, insS){
		if(typeof insS !== 'string') done('not string: '+JSON.stringify(insS));
		else stringRes['insertBatch'] = [insS, done(err)][0];
	    });
	});});

	describe('batch()', function(){it('insert and return batch of docs', function(done){
	    var docs = tdata.school; var ops = {};

	    pgx.batchInsert('school', docs, ops, function(err, res){
		//check the res against the doc
		console.log('res',res);
		console.log('err',err);
		done(err?JSON.stringify(err):null);
	    });
	});});

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
	    it.skip('should make a properly formatted read string', function(done){
		
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
