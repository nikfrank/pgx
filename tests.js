var assert = require('assert');

var env = 'test';
var config = require('./config')[env];

var conop = config.conop;

var schemas = require('./schemas');

var pg = require('pg');
var pgx = require('./pgx')(pg, config.conop, schemas);


var teststatus = '';

var palrule = {"rule":
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



describe('pgx', function(){

    before(function(done){
	pgx.boot({empty:true}, function(res){
	    //check res?
	    done();
	}, function(err){done(err);});
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
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('insert', function(){
	describe('(stringOnly:true)', function(){
	    it('should make a properly formatted insert string', function(done){
		
		var doc = palrule;
		var ops = {stringOnly:true};

		pgx.insert('rule', doc.rule, ops, function(err, ruleS){
		    //check the content of the string?
		    done(err||((typeof ruleS !== 'string')?'not a string':undefined));
		});

	    });
	});

	describe('()', function(){
	    it('should return the inserted document', function(done){

		var doc = palrule;
		var ops = {};

		pgx.insert('rule', doc.rule, ops, function(err, res){
		    //check the res against the doc
		    done(err);
		});

	    });
	});

	describe('batch()', function(){
	    it.skip('should batch insert records in the db', function(done){
		//
	    });
	});

	after(function(){ teststatus = 'insert'; });
    });
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('read', function(){

	before(function(done){
	    var ii; ii = setInterval(function(){
		if(teststatus === 'insert'){
		    clearInterval(ii);
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

	describe('({orderby:{col:"name",order:"asc"}})', function(){
	    it.skip('should find docs and return them sorted', function(done){
		pgx.read('rule', {lang:'iw',type:'v'}, {orderby:{col:"name",order:"asc"}}, function(err, res){
		    //check order of array?
		    done(err);
		});
	    });
	});

	after(function(){ teststatus = 'read'; });

    });
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('update', function(){


	before(function(done){
	    var ii; ii = setInterval(function(){
		if(teststatus === 'read'){
		    clearInterval(ii);
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
	    it.skip('should update a record in the db', function(done){
		//
	    });
	});

	after(function(){ teststatus = 'update'; });
    });
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
    describe('erase', function(){

	before(function(done){
	    var ii; ii = setInterval(function(){
		if(teststatus === 'update'){
		    clearInterval(ii);
		    done();
		}
	    }, 90);
	});
	
	describe('()', function(){
	    it.skip('should erase a record from the db', function(done){
		//
	    });
	});

	after(function(){ teststatus = 'erase'; });

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


function gendoc(schema){
    // generate a random doc from the schema... there might be a plugin for this

    


}
