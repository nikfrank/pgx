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

    var queryString = function(query){
	
    };

    pg.query = function(query, callback){
	// call queryString
	// this handles the pg call, promise, callback
    };

    var insertValue = function(schemaName, query){
	// run any schema prehandlers
	var valreq = '(';
	var schema = schemas[schemaName];
	if(!((schemaName+'_hash') in query)) query[schemaName+'_hash'] = hash();
	valreq += query[schemaName+'_hash'];
	var xattrs = query[schemaName+'_xattrs']||{};
	for(var ff in query) if(!inSchema(ff,schemaName)) xattrs[ff] = query[ff];
	valreq += ','+formatAs(xattrs, 'json');
	Object.keys(schema).sort().forEach(function(ff){ valreq += ','+formatAs(query[ff], schema[ff]);});
	return valreq+')';
    };

    function formatAs(qval, type){
	var dm = dmfig(qval);
	// could define the first char as * pointer, $ custom
	if(type.indexOf('[]')===-1){
	    switch(type.split('*')[0].split('(')[0]){
	    case 'varchar': case 'text': case 'interval': case '':
		if((typeof data === 'undefined')||(!data.length)||
		   ((JSON.stringify(data) === 'null')&&(data !== 'null'))) return 'null';
		return (dm + data + dm);
	    case 'timestamp':
		if(data === 'now()') return (dm + (new Date()).toISOString() + dm);
		else return (dm + (new Date(data)).toISOString() + dm);
	    case 'json':
		return (dm + JSON.stringify(data) + dm + '::json');
	    default: // number, boolean
		if(data === '') return 'null';
		else return ('' + data);
	    }
	}else{//arrays --> make sure this works with json
	    if(!((data||[]).length)) return 'ARRAY[]::'+type;
	    switch(type.split('*')[0].split('(')[0].split('[')[0]){
	    case 'varchar': case 'text': case 'interval': case '':
		return data.reduce(function(p,c){return p+dm+c+dm+','},'ARRAY[').slice(0,-1)+']';
	    case 'json':
		return data.reduce(function(p,c){return p+dm+c+dm+'::json,'},'ARRAY[').slice(0,-1)+']';
	    default:
		return data.reduce(function(p,c){return p+c+','},'ARRAY[').slice(0,-1)+']';
	    }
	}
    }

    var insertStmt = function(schemaName){
	var schema = schemas[schemaName];
	var qreq = 'insert into '+schemaName+' ('+schemaName+'_hash,'+schemaName+'_xattrs';
	Object.keys(schema).sort().forEach(function(ff){ qreq += ','+ff; });
	return (qreq + ') values ');
    };

    var retClause = function(schemaName, fields, as){
	var schema = schemas[schemaName];
	as = as||schemaName;
	if(!(fields||[]).length) fields=[schemaName+'_hash',schemaName+'_xattrs'].concat(Object.keys(schema));
	
	return fields.reduce(function(p,c){
	    return p+(inSchema(c,schemaName))?
		schemaName+'.'+c+' as '+as+'__'+c+',':
		'json_extract_path('+schemaName+'.'+schemaName+'_xattrs,'+c+') as '+as+'__'+c+',';
	},'').slice(0,-1);
    };

    pg.insert = function(schemaName, query){
	var qreq = insertStmt(schemaName), vreq = insertValue(schemaName, query),
	rreq = retClause(schemaName);

	// insert value does all inbound conversions
	// retClause should take care of xattrs depth read

	// call pg

	// format out is still going to have to flatten the json
    };

    pg.boot = function(options, callback, errcallback){
	if(!errcallback) errcallback = callback;
	// schemaValidCheck

	pg.connect(conop, function(err, client, done) {
	    if(err) return errcallback({err:err}); // read schemas from schemas table
	    client.query('select * from schemas;', function(scerr, oldschemarow){
		var oldschemas, firstBoot = false;
		if(scerr){ // assume init, fleg create schemas table for later
		    oldschemas = {};
		    firstBoot = true;
		}else oldschemas = ((oldschemarow.rows[0]||{}).schemas||{});

		var selt = 'select array_to_json('; // pull all old data at once
		for(var ss in schemas) selt += '(select array_agg(row_to_json('+ss+')) from '+ss+') || ';
		selt = selt.slice(0,-3) + ');';

		client.query((options.empty?'':selt), function(selerr, oldrowres){
		    if(selerr){
			if(selerr.code !== '42P01') return errcallback({selerr:selerr, selt:selt});
			else oldrowres = {rows:[]}; // ignore "table does not exist" errors
		    }
		    var oldrows = (oldrowres.rows[0]||{}).array_to_json, datas = {};
		    for(var ss in schemas) datas[ss] = [];
		    for(var i=(oldrows||[]).length; i-->0;) datas[whichSchema(oldrows[i])].push(oldrows[i]);

		    var boot = ''; // bootstring
		    for(var oldSchemaName in oldschemas){
			var oldschema = oldschemas[oldSchemaName], schema = schemas[oldSchemaName];
			if(JSON.stringify(oldschema) !== JSON.stringify(schema)){
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

		    client.query(boot, function(booterr, bootres){
			if(booterr) return errcallback({booterr:booterr, string:boot});
			else return callback({schemas:schemas});
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
	    for(var ff in schema) qq += ff+' '+schema[ff]+',';
	    for(var ff in defaultFields) qq += schemaName+'_'+ff +' '+ defaultFields[ff]+',';
	    qq = qq.slice(0,-1) + '); commit;';
	    return qq;
	}
    };

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
}


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


function TEST(){
    
    var schemas = {
	person:{
	    name:'text',
	    fbid:'text', // unique
	    country:'text',
	    teachers:'*person[]',
	    school:'*school'
	},
	school:{
	    name:'text',
	    country:'text',
	    teachers:'*person[]',
	    students:'*person[]'
	},
	testres:{
	    student:'*person',
	    teacher:'*person',
	    school:'*school',
	    date:'date',
	    grade:'number'
	}
    }

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
	    teachers:['any', {name:'nik', country'IL'}]
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
