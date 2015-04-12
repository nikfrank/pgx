var btoa = require('btoa');

module.exports = function(pg, conop, schemas){

// todo -> port over nuboot code, implement typeOnly shortcut
// implement foreign keys in boot
// implement schemaVerify
// implement data/schema map in boot

// refactor old read for foreign keys

// refactor old fmtwhere as fmtwhere > fmtin
// this is used in read, update
// now to handle conversions for custom types on inserts
// to have fmtout for out conversions
// eg file, geoHash, etc.

// port insert, batchInsert - check with foreign keys

// make sure all json depth reading works

// implement WITH, WITH RECURSIVE features and predicates.

// port read into update.
// port read into erase/expire

// get rid of join reads
// all joining done on client.


    var jsql = {};
    
    jsql.process = function(){
	// use this to process query lists into batch calls or whatever
	// which can be executed parallel if you want
    };

    pg.query = function(calls, callback){
	// multiquery top level calls

	// array of calls like

	var callsArraySerial = [
	    ['create', 'person', {person:'object'}, 'ResultTag']

	    // create starts the sql string and provides schema context to the squery
	    // simple squery -> just an object
	    // returns it into the 'ResultTag' tag for later calls/return val


	    ['update', 'school', // ['uquery using ResultTag'], 'ie',
             {
		 where:{school_hash:'school0'},
		 set:{students:['concat', ['map', ['prop','person_hash'], ['prev','ResultTag']] ] }
	     },
	     'FinalRes'
	    ]
	];

	// in parsing the depth chain, []s are traversed until a {} or val is found
	// at this point, the function of the [] must be called to know how to handle it

	// update starts the sql string, and gives where and set schema context

	// where uses the object to write a where clause
	  // I feel like most QLs that exist do this? thus it can be a standard feature of update calls

	// set is the second part of the where-set update structure
	// he makes a set statement based on the data in the first parameter

	// set uses data from previous tagged calls to fill in data
	// he does this by calling jsql.process on the field's value with prevTag context

	// jsql has a list of registered annotated functions he knows he can call

        // using '`' we can escape function calls in order that it not be processed
	// but really ` is a function which returns the rest of the params in an array

	// set loops through the obj fields to prepare the set statement values & operations
	  // concat with one param is an operator function... he returns a function taking the fieldName
                                              // which returns sql with the operator and values baked in
	    // map with two params will return data having applied the fnP1 to the dataP2
	      // prop returns a function extracing a the 'person_hash' property from an object
	      // prev returns the data from the ResultTag call
	    // map applies the propFn to the prevData, resulting in an array of person_hashes
	  // concat returns a function which will turn fieldName into 'fieldName (concat op) (mapData)' sql
	// set applies the concat function to the students fieldName, and appends the sql to the queryString

	// update prepares the "as" clause



	// can be done parallel if the programmer is confident in atomicity




    };

    //into the

    // create, update, read, erase api

    var selectString = function(query){
	
    };

    pg.read = function(rootTag, query, callback){
	// call queryString
	// this handles the pg call, callback

// a query is an {schemaOrTag:squery, ..} object
// the squerys may reference the results of eachother
// as long as there is no circular dep (maybe later?)

// the squery is either a simple object
// {field:fquery, ..}
//
// or a simple array
// [squery, optionObject]
//
// or when a tag is used
// ['schema', squery, optionObject]

// fquery can be a value for simple equality
// {schema:{field:'value'}}
//
// or a predicate
// {schema:{field:['contains', 'value']}}
// of which I imagine I will make many.
// The predicates available will depend on data-type

// all data comes out as flat-schema objects
// the predicate data exists only in the context of the query
// unless you pull it with a subsequent tagQuery
// {schema:{field:'val', pointerField:fquery}
//  tag:['prevQuery', 'schema', 'pointerField']}
// tag would include any doc pointed to from schema payload
// not nec. the result of the fquery as an squery

// maybe there should be an shortcut option for 'subDocs'

// this can be accomplished in one query using the WITH keyword?
// table name is now just the schemaName



	// operations within jsql need annotation
	// thus, the strategizer here can determine which point at eachother
	// to correctly analyze root schemas, recursive clauses

	for(var sq in query){
	    // rootTag is first to call
	}

	// determine any with clauses which require use


	var stmt = 'select [[returning clause]] from [[table]] where [[where clause.. and where clause]];'

	callback('unimp');
    };

    pg.update = function(query, callback){

	// 
	var link = function(query, callback){
	    // convenience for two-way array linking (graph db style)
	    var q = {
		person:{
		    person_hash:'person0',
		    schools:'school0'
		},
		school:{
		    school_hash:'school0',
		    students:'person0'
		}
	    };
	};

	var unlink = function(query, callback){
	    // same as link except that this unlinks the two
	};

    };

    pg.create = function(schemaName, query, options, callback){
	// look through query for any * fields with subqueries... allow this?
	// instinctively this should be taken care of by the client cache

	if(!callback){
	    callback = options;
	    options = {};
	}

	var qreq = insertStmt(schemaName), vreq = insertValue(schemaName, query),
	rreq = retClause(schemaName);

	// run any schema prehandlers
	// retClause should take care of xattrs depth read
	var istt = insertStmt(schemaName);
	var ival = insertValue(schemaName, query); // assumes non-array
	var rcla = ' returning '+retClause(schemaName);

	if(options.stringOnly) return callback(null, istt+ival+rcla);

	pg.connect(conop, function(err, client, done) {
	    if(err) return callback({err:err});
	    client.query(istt+ival+rcla, function(inserr, inspon){
		// format out is still going to have to flatten the json
		if(inserr) return callback({inserr:inserr, str:istt+ival+rcla});
		callback(null, inspon);
		done();
	    });
	});

    };

    function insertValue(schemaName, query){
	var schema = schemas[schemaName];
	var valreq = '(';
	if(!((schemaName+'_hash') in query)) query[schemaName+'_hash'] = hash();
	valreq += formatAs(query[schemaName+'_hash'], 'varchar(31)');
	var xattrs = query[schemaName+'_xattrs']||{};
	for(var ff in query) if(!inSchema(ff,schemaName)) xattrs[ff] = query[ff];
	valreq += ','+formatAs(xattrs, 'json');
	Object.keys(schema).sort().forEach(function(ff){ valreq += ','+formatAs(query[ff], schema[ff]);});
	return valreq+')';
    };

    function insertStmt(schemaName){
	var schema = schemas[schemaName];
	var qreq = 'insert into '+schemaName+' ('+schemaName+'_hash,'+schemaName+'_xattrs';
	Object.keys(schema).sort().forEach(function(ff){ qreq += ','+ff; });
	return (qreq + ') values ');
    };

    function retClause(schemaName, fields, as){
	var schema = schemas[schemaName];
	as = as||schemaName;
	if(!(fields||[]).length) fields=[schemaName+'_hash',schemaName+'_xattrs'].concat(Object.keys(schema));
	
	return fields.reduce(function(p,c){
	    return p+(inSchema(c,schemaName))?
		schemaName+'.'+c+' as '+as+'__'+c+',':
		'json_extract_path('+schemaName+'.'+schemaName+'_xattrs,'+c+') as '+as+'__'+c+',';
	},'').slice(0,-1);
    };



    pg.boot = function(options, callback){
	// schemaValidCheck

	pg.stats(function(stats){

	pg.connect(conop, function(err, client, done) {
	    if(err) return callback({err:err}); // read schemas from schemas table
	    client.query('select * from schemas;', function(scerr, oldschemarow){
		var oldschemas, firstBoot = false;
		if(scerr){ // assume init, flag create schemas table for later
		    oldschemas = {};
		    firstBoot = true;
		}else oldschemas = ((oldschemarow.rows[0]||{}).schemas||{});

		if(JSON.stringify(Object.keys(stats).sort())!==JSON.stringify(Object.keys(oldschemas).sort())){
		    // discrepancy, throw error?
		    console.log('WARNING!!! SCHEMAS NOT CONSISTENT WITH DATA.');
		    for(var sc in stats) if(!(sc in oldschemas)) oldschemas[sc] = 'grab old schema?';
		}

		var selt = 'select array_to_json('; // pull all old data at once
		for(var ss in schemas) selt += '(select array_agg(row_to_json('+ss+')) from '+ss+') || ';
		selt = selt.slice(0,-3) + ');';

		client.query((options.empty?'':selt), function(selerr, oldrowres){
		    if(selerr){
			if(selerr.code !== '42P01') return callback({selerr:selerr, selt:selt});
			else oldrowres = {rows:[]}; // ignore "table does not exist" errors
		    }
		    var oldrows = (oldrowres.rows[0]||{}).array_to_json, datas = {};
		    for(var ss in schemas) datas[ss] = [];
		    for(var i=(oldrows||[]).length; i-->0;) datas[whichSchema(oldrows[i])].push(oldrows[i]);

		    var boot = ''; // bootstring
		    for(var oldSchemaName in oldschemas){
			var oldschema = oldschemas[oldSchemaName], schema = schemas[oldSchemaName];
			if((JSON.stringify(oldschema) !== JSON.stringify(schema))||options.empty){
			    boot += drop(oldSchemaName); // drop
			    boot += create(oldSchemaName, schema); // create, then replace
			    boot += 'begin; ';
			    for(var i=datas[oldSchemaName].length; i-->0;)
				if(datas[oldSchemaName][i][oldSchemaName+'_hash'] !== null)
				    boot += insertValue(oldSchemaName, datas[oldSchemaName][i]);
			    boot += 'commit;';
			}// else that the schema is unaltered, leave the relation be!
		    }
		    for(var schemaName in schemas) if(!(schemaName in oldschemas))
			boot += create(schemaName, schemas[schemaName]);
		    
		    var overwriteSchemas = 'begin; ';
		    if(firstBoot) boot += 'begin; create table schemas (schemas json); commit;'
		    else overwriteSchemas += 'delete from schemas; commit; begin; ';
		    
		    overwriteSchemas += 'insert into schemas (schemas) values ('
			+('$$' + JSON.stringify(schemas) +'$$::json') + '); commit;';
		    boot += overwriteSchemas;
		    
		    if(options.stringOnly) return callback(null, boot);

		    client.query(boot, function(booterr, bootres){
			done();
			if(booterr) return callback({booterr:booterr, string:boot});
			else return callback(null, {schemas:schemas});
		    });
		});
	    });
	});
	function drop(oldSchemaName){
	    return 'begin; insert into '+oldSchemaName+' ('+oldSchemaName+'_hash) values'+
		' ($$whatever$$); commit; begin; drop table '+oldSchemaName+'; commit;';
	}
	function create(schemaName, schema){
	    var defaultFields = {hash:'varchar(31)', xattrs:'json'};
	    var qq = 'begin; create table '+schemaName+' (';
	    for(var ff in schema)
		qq += ff+' '+((schema[ff][0]==='*')?('varchar(31)'+((schema[ff].indexOf('[]')>-1)?'[]':'')):
			      schema[ff])+',';
	    for(var ff in defaultFields) qq += schemaName+'_'+ff +' '+ defaultFields[ff]+',';
	    qq = qq.slice(0,-1) + '); commit;';
	    return qq;
	}
	});
    };

    function formatAs(qval, type){
	var dm = dmfig(qval);
	// could define the first char as * pointer, $ custom
	if(type.indexOf('[]')===-1){
	    switch(type.split('*')[0].split('(')[0]){
	    case 'varchar': case 'text': case 'interval': case '':
		if((typeof qval === 'undefined')||(!qval.length)||
		   ((JSON.stringify(qval) === 'null')&&(qval !== 'null'))) return 'null';
		return (dm + qval + dm);
	    case 'timestamp':
		if(qval === 'now()') return (dm + (new Date()).toISOString() + dm);
		else return (dm + (new Date(qval)).toISOString() + dm);
	    case 'json':
		return (dm + JSON.stringify(qval) + dm + '::json');
	    default: // number, boolean
		if(qval === '') return 'null';
		else return ('' + qval);
	    }
	}else{//arrays --> make sure this works with json
	    if(!((qval||[]).length)) return 'ARRAY[]::'+type;
	    switch(type.split('*')[0].split('(')[0].split('[')[0]){
	    case 'varchar': case 'text': case 'interval': case '':
		return qval.reduce(function(p,c){return p+dm+c+dm+','},'ARRAY[').slice(0,-1)+']';
	    case 'json':
		return qval.reduce(function(p,c){return p+dm+c+dm+'::json,'},'ARRAY[').slice(0,-1)+']';
	    default:
		return qval.reduce(function(p,c){return p+c+','},'ARRAY[').slice(0,-1)+']';
	    }
	}
    }
    function inSchema(ff, schemaName){
	if((ff === schemaName+'_hash')||(ff === schemaName+'_xattrs')) return true;
	else return (Object.keys(schemas[schemaName]).indexOf(ff)>-1);
    }
    function whichSchema(itm){
	for(var ff in itm) if(ff.indexOf('_hash')>0) return ff.slice(0,-5);
    }
    function dmfig(s){
	if(typeof s === 'number') return '';
	var n=0, S = JSON.stringify(s), ns = 'lll';
	while((new RegExp('$'+ns+'$')).test(S)) ns = btoa(''+(((++n)-n%100)/100)+''+((n%100-n%10)/10)+''+n%10);
	return '$'+ns+'$';
    }
    function hash(){
	var hmac = crypto.createHmac("sha1", "the toronto maple leafs are turrible"); 
        var hash2 = hmac.update(''+((new Date()).getTime())+''+Math.random());
        return hmac.digest(encoding="base64").replace('/', '_');
    }

    pg.stats = function(callback){
        pg.connect(conop, function(err, client, done){
	    if(err) return callback({connection_err:err});
	    client.query('SELECT schemaname,relname,n_live_tup FROM pg_stat_user_tables '+
			 '  ORDER BY n_live_tup DESC;', function(ierr, ires){
			     done();
			     var ret = {};
			     ires.rows.forEach(function(ri){
				 if(ri.relname !== 'schemas') ret[ri.relname] = parseInt(ri.n_live_tup);
			     });
			     return callback(ret);
			 });
	});
    };

    return pg;

}




function TEST(){
    
    // put into a testrunner

    // insert data .........................


    var q1 = {
	person:{
	    name:'nik'
	}
    };

    var q2 = {
	person:[{name:['contains', 'nik']},
		{limit:1}]
    };

    var q3 = {
	person:{
	    teachers:['any', {name:'nik', country:'IL'}]
	}
    };

    var q4 = {
	person:{
	    school:{country:'IL'}
	}
    };

    var q5 = {
	person:{
	    school:{country:['ignoreCase', 'il']}
	}
    };

    // A's since the start of the term (feb 1)
    var q6 = {
	testres:{
	    grade:['gte', 80],
	    date:['gt', new Date(2015, 3, 1)]
	}
    };
    var q6alt = {
	testres:{
	    grade:['gte', 80],
	    date:['gt', ['date', 2015, 'feb', 1]]
	}
    };

    // query for person(s) named nik in israel
    // then query for person(s) as student for whom
    // the teacher field includesAny of the result of the person query
    // returns data as {person:[...], student:[...]}
    var nuq = {
	person:{name:'nik', country:'IL'},
	student:['person', {teachers:['includesAny', ['prevQuery','person']]}]
    };



    // the prevQuery calls must be used to create the heirarchy of querying.

    pgj.query(q1, function(ppl){
	console.log(ppl);
	// assert nik
    });

}
