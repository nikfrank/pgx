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

var jsonNice = require('json-nice');

// refactor these for the jdata
// try to keep the tests lined up with jtests

describe('pgx', function(){

    before(function(done){
	pgx.boot({empty:true}, function(res){
	    done();
	}, function(err){
	    done(JSON.stringify(err));
	});
    });

    after(function(done){

	// empty out the database

	fs.writeFile("./pStringRes.json", jsonNice(stringRes), function(err){
	    if(err) return done(err);
	    console.log("The file was saved!");
	    done();
	}); 
    });

//---------------------------------------------------------------------------

var checkStr = function(name, done){
    return function(err, insS){
	if(typeof insS !== 'string') done('not string: '+JSON.stringify(insS));
	else stringRes[name] = [insS, done(err)][0];
    };
};

var checkObj = function(obj, done, appToRes){
    appToRes = appToRes||function(r){return r};
    return function(err, res){
	if(err) return done(JSON.stringify(err));
if('write out all comparisons'&&false){
    console.log(' ');
    console.log(' ');
    console.log(jsonNice(obj));
    console.log(' ');
    console.log(jsonNice(res));
    console.log(' ');
    console.log(' ');
}
	try{
	    assert.deepEqual(appToRes(res), obj);
	}catch(e){
	    return done(JSON.stringify(obj)+' isn\'t '+JSON.stringify(res));
	}
	done();
    };
};

//---------------------------------------------------------------------------
    describe('insert', function(){
	
	describe('(stringOnly:true)', function(){it('ins string correct', function(done){
	    var doc = tdata.person[0]; var ops = {stringOnly:true};
	    pgx.insert('person', doc, ops, checkStr('insert', done));
	});});
	describe('()', function(){ it('should return the inserted document', function(done){
	    var doc = tdata.person[0]; var ops = {};
	    pgx.insert('person', doc, ops, checkObj(tdata.person[0], done));
	});});
	// returning
	describe('(returning:[], stringOnly:true)', function(){it('insRet string correct', function(done){
	    var doc = tdata.person[1]; var ops = {returning:['person_hash', 'country'], stringOnly:true};
	    pgx.insert('person', doc, ops, checkStr('insertReturning', done));
	});});
	describe('(returning:[])', function(){it('should return the reqd fields', function(done){
	    var doc = tdata.person[1]; var ops = {returning:['person_hash', 'country']};
	    var partPerson = {}; ops.returning.forEach(function(r){partPerson[r] = doc[r]});
	    pgx.insert('person', doc, ops, checkObj(partPerson, done));
	});});
	// xattrs
	describe('(returning:[xattr], stringOnly:true)', function(){it('insRetX string correct', function(done){
	    var doc = tdata.person[2]; var ops = {returning:['person_hash', 'mainlang'], stringOnly:true};
	    pgx.insert('person', doc, ops, checkStr('insertReturningXattr', done));
	});});
	describe('(returning:[xattr])', function(){it('should return the reqd fields + xattr', function(done){
	    var doc = tdata.person[2]; var ops = {returning:['person_hash', 'mainlang']};
	    var partPerson = {}; ops.returning.forEach(function(r){partPerson[r] = doc[r]});
	    pgx.insert('person', doc, ops, checkObj(partPerson, done));
	});});
	describe('(returning:[invalidXattr])', function(){it('should return invalidXattr as null', function(done){
	    var doc = tdata.person[3]; var ops = {returning:['person_hash', 'lang']};
	    var partPerson = {}; ops.returning.forEach(function(r){partPerson[r] = doc[r]||null});
	    pgx.insert('person', doc, ops, checkObj(partPerson, done));
	});});

	describe('batch(stringOnly)', function(){it('insBatch string', function(done){
	    var docs = tdata.school; var ops = {stringOnly:true};
	    pgx.batchInsert('school', docs, ops, checkStr('insertBatch', done));
	});});
	describe('batch()', function(){it('insert and return batch of docs', function(done){
	    var ss = 'school'; var docs = tdata[ss]; var ops = {};
	    pgx.batchInsert(ss, docs, ops, checkObj(docs, done, function(res){
		return res.sort(function(a,b){ return a[ss+'_hash'] > b[ss+'_hash'];});
	    }));
	});});

	// check that duplicate hash insert fails

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


	describe('(stringOnly:true)', function(){it('read string', function(done){
	    var query = {}; var ops = {stringOnly:true}; var ss = 'person';
	    pgx.read(ss, query, ops, checkStr('read', done));
	});});
	describe('()', function(){it('read persons', function(done){
	    var query = {}; var ops = {}; var ss = 'person';
	    pgx.read(ss, query, ops, checkObj(tdata.person, done, function(res){
		return res.sort(function(a,b){ return a[ss+'_hash'] > b[ss+'_hash'];});
	    }));
	});});
	describe('({field:"val"}, stringOnly:true)', function(){it('read simple query string', function(done){
	    var query = {name:'Nik Frank'}; var ops = {stringOnly:true}; var ss = 'person';
	    pgx.read(ss, query, ops, checkStr('readSimpleQuery', done));
	});});
	describe('({field:"val"})', function(){it('read persons by simple query', function(done){
	    var query = {name:'Nik Frank'}; var ops = {}; var ss = 'person';
	    pgx.read(ss, query, ops, checkObj([tdata.person[1]], done));
	});});


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
