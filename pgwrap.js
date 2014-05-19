var crypto = require('crypto');
var btoa = require('btoa');

var dmfig = function(s){
    // determine the first delimiter of style $N$ which isnt present
    var n=0;
    var S = JSON.stringify(s);
    var ns = btoa(''+((n-n%100)/100)+''+((n%100-n%10)/10)+''+n%10);

    while( (new RegExp('$'+ns+'$')).test(S) ){
	++n;
	ns = btoa(''+((n-n%100)/100)+''+((n%100-n%10)/10)+''+n%10);
    }
    return '$'+ns+'$';
};

var fmtret = function(rop){
    var rreq = '*';
    if(rop){
	if(typeof rop === 'string'){
	    rreq = rop;
	}else if(rop.constructor == Array){
	    rreq = '(';
	    for(var i=0; i<rop.length; i++) rreq += rop[i] +',';
	    rreq = rreq.substr(0, rreq.length-1);
	    rreq += ')';
	}
    }
    return rreq;
};

var formatas = function(data, type, dm, old){
    // data is the data object, style is which type of query

    var ret = '';

    //string
    if(type.indexOf('varchar') !== -1){ // grab varchar \d+ length and truncate?
	//if empty string put null
	if((typeof data === 'undefined')||((JSON.stringify(data) === 'null')&&(data !== 'null'))) return 'null';
	else if(!data.length) return 'null';

	if(type.indexOf('[')===-1) return (dm + query[ff] + dm);

	//array
	else{
	    if(!data.length) return ('ARRAY[]::'+schema.fields[ff].type);
	    else{
		ret += 'ARRAY[';
		for(var i=data.length; i-->0;) ret += dm + data[i] + dm + ',';
		ret = ret.substr(0, ret.length-1);
		ret += ']';
		
		return ret;
	    }
	}
    }

    //timestamp
    else if(type === 'timestamp'){
	if(data === 'now()') return (dm + (new Date()).toISOString() + dm);
	else return (dm + (new Date(query[ff])).toISOString() + dm);
    }

    //json
    else if(type.indexOf('json') !== -1){
	//XOVR old with data, then write
	if(typeof old !== 'undefined'){
	    if(old.constructor == Object){
		for(var ff in data) old[ff] = data[ff];
		data = old;
	    }else if(old.constructor == Array){
		for(var i=0; i<data.length; i++){
		    if(!old[i]) old[i] = {};
		    for(var ff in data[i]) old[i][ff] = data[i][ff];
		}
		data = old;
	    }
	}

	if(type.indexOf('[') === -1) return (dm + JSON.stringify(data) + dm + '::json');

	//array
	else{
	    if(!data) return 'ARRAY[]::json[]';
	    else if(!data.length) return 'ARRAY[]::json[]';
	    else{
		ret += 'ARRAY[';
		for(var i=data.length; i-->0;)
		    ret += dm + JSON.stringify(data[i]) + dm + '::json,';
		ret = ret.substr(0, ret.length-1);
		ret += ']';

		return ret;
	    }
	}
    }

    // int/bool
    else{
	if(type.indexOf('[') === -1) return ('' + data);

	//array
	else{
	    if(!data) return ('ARRAY[]::'+type);
	    else if(!data.length) return 'null';
	    else{
		ret += 'ARRAY[';
		for(var i=data.length; i-->0;) ret += data[i] + ',';
		ret = ret.substr(0, ret.length-1);
		ret += ']';
		
		return ret;
	    }
	}
    }


};

module.exports = function(pg, conop, schemas){

    pg.conop = conop;
    pg.schemas = schemas;
    
    pg.insert = function(schemaName, query, options, callback){
	
	var schema = schemas.db[schemaName];

	var qreq = 'insert into '+schema.tableName+' (';
	var valreq = ') values (';

	if(!('hash' in query)){
	    // make up a hash
            var hmac = crypto.createHmac("sha1", "the toronto maple leafs are garbage"); 
            var hash2 = hmac.update(''+((new Date()).getTime())+''+Math.random());
            var digest = hmac.digest(encoding="base64");

	    query.hash = digest;//28chars good enough
	}

	// build the insert statement
	for(var ff in schema.fields){
	    if(ff === schemaName+'_xattrs') continue;
	    if(!(ff in query)) if('defval' in schema.fields[ff]) query[ff] = schema.fields[ff].defval;

	    if(ff in query){
		qreq += ff + ',';
		
		var dm = dmfig(query[ff]);

		valreq += formatas(query[ff], schema.fields[ff].type, dm) + ',';
	    }
	}

	//put the other fields of query into xattrs if any
	var xat = query[schemaName+'_xattrs']||{};
	for(var ff in query){
	    if(ff === schemaName+'_xattrs') continue;
	    if(!(ff in schema.fields)) xat[ff] = query[ff];
	}
	if(JSON.stringify(xat).length>2){
	    qreq += schemaName+'_xattrs,';
	    var dm = dmfig(xat);
	    valreq += dm + JSON.stringify(xat) + dm +'::json,';
	}

	if(qreq.length === 21) return callback({err:'nodata'});

	qreq = qreq.substr(0, qreq.length-1);
	valreq = valreq.substr(0, valreq.length-1);

	var rreq = fmtret(options.returning);

	var treq = qreq + valreq + ') returning '+rreq+';';

	if(options.stringOnly) return treq;

	pg.connect(conop, function(err, client, done) {
	    if(err) return res.json({connection_err:err});

	    client.query(treq, function(ierr, ires){
		if(ierr) return res.json({ierr:ierr});

		done();
		return callback(ierr, ires);
	    });
	});
    };


    pg.batchInsert = function(schemaName, queryArray, options, callback){
	
	var schema = schemas.db[schemaName];

	var qreq = 'insert into '+schema.tableName+' (';
	var valreq = ') values ';


	// loop over queryArray, adding values () blocks for each one

    });


    pg.update = function(schemaName, input, options, callback){
	
	var schema = schemas.db[schemaName];

	var qreq = 'update '+schema.tableName+' set ';
	var wreq = ' where ';

	var where = input.where;
	var query = input.data;
	
	// where query
	for(var ff in where){
	    if(ff in schema.fields){
		if(typeof where[ff] === 'string') wreq += ff + '=\'' + where[ff] + '\' and ';
		else if(typeof where[ff] === 'number') wreq += ff + '=' + where[ff] + ' and ';
		else if(typeof where[ff] === 'object'){		
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
// THIS IS WHERE TO PUT DEPTH READING
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------

		    //this should also be used in all cases of xattr query
		    // xattrs->'key'='val' (I think)
		}
	    }else{
		// xattr reads
	    }
	}
	wreq = wreq.substr(0, wreq.length-4);

	var urreq = '*';
	// loop through query and where to grab only fields requested

	var sreq = 'select '+urreq+' from '+schema.tableName+wreq+';';

	// select the record
	pg.connect(conop, function(err, client, done) {
	    if(err) return res.json({err:err});
	    client.query(sreq, function(serr, sres){

		// insert if n'exist pas
		if(!sres.rows.length){
		    done();

		    if(options.noinsert){ // document this
			return callback({err:'noent', where:where});
		    }

		    //put query and where together
		    var qq = {};
		    for(var ff in query) qq[ff] = query[ff];
		    for(var ff in where) qq[ff] = where[ff];

		    return pg.insert(schemaName, qq, options, callback);
		}

		// build the query for updating
		var doc = sres.rows[0];
		for(ff in query){
		    if(ff === schemaName+'_xattrs') continue;
		    if(!(ff in schema.fields)) continue;
		    qreq += ff + '=';
		    var dm = dmfig(query[ff]);

//document options.xorjson
		    if(schema.fields[ff].type.indexOf('json')>-1) if(options.xorjson) old = doc[ff];

		    qreq += formatas(query[ff], schema.fields[ff].type, dm, old) + ',';

		}

		//put the other fields of query into xattrs if any
		var xat = doc[schemaName+'_xattrs']||{};
		for(var ff in query){
		    if(ff === schemaName+'_xattrs') continue;
		    if(!(ff in schema.fields)) xat[ff] = query[ff];
		}
		if(JSON.stringify(xat).length>2){
		    qreq += schemaName+'_xattrs=';
		    var dm = dmfig(xat);
		    qreq += dm + JSON.stringify(xat) + dm +'::json,';
		}

		if(qreq.length === 21) return callback({err:'nodata'});

		qreq = qreq.substr(0, qreq.length-1);

		var rreq = fmtret(options.returning);

		var treq = qreq + wreq + ' returning '+rreq+';';

		client.query(treq, function(ierr, ires){
		    if(ierr) return res.json({ierr:ierr});

		    done();
		    return callback(ierr, ires);
		});
	    });
	});
    };



    pg.read = function(schemaNameOrNames, query, options, callback){
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
// THIS IS WHERE TO PUT MULTISCHEMA (JOIN) READS
//-----------------------------------------------------------------------------------------
//
//  ['schema1','schema2'], {schema1:{query}, schema2:{query} }, {returning:{schema1:{r}, schema2:{r} } }
//
// if(typeof schemaNameOrNames === 'object')-> // array
//
//   determine the join column for these two schema (if none, error!)
//   query should be split by schema
//   select s1.returning,s2.returning from s1.tn join s2.tn on join-column1=join-column2
//      where s1.where and s2.where
//-----------------------------------------------------------------------------------------

	if(typeof schemaNameOrNames === 'string') schemaName = schemaNameOrNames;

	var schema = schemas.db[schemaName];

	var rreq = fmtret(options.returning); // which columns to select

	var qreq = 'select '+rreq+' from '+schema.tableName;
	var wreq = ' where ';

	for(var ff in query){
	    if(ff in schema.fields){

		if(typeof query[ff] === 'object'){

//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
// THIS IS WHERE TO PUT OPERATOR DYNAMIC (ie range/regexp queries)
//-----------------------------------------------------------------------------------------
//
// if query[ff] is object, if the field name starts with $ -> implement mongo type query
//
//-----------------------------------------------------------------------------------------
// if this is a simple depth read case:
// (this is where to put recursive depth reading)
// this currently only supports tring depth reads.

		    for(var kk in query[ff]){
			
			var dmk = dmfig(kk);
			var dm = dmfig(query[ff][kk]);
			wreq += ff + '->>' + dmk + kk + dmk + '=' + dm + query[ff][kk] + dm + ' and ';//formatas?
		    }

		}else{
		    var dm = dmfig(query[ff]);

		    wreq += ff + '=' + formatas(query[ff], schema.fields[ff].type, dm) + ' and ';
		}
	    }

	    // xattr reads
	    else{
		
		var dmk = dmfig(ff);
		var dm = dmfig(query[ff]);

		wreq += schemaName + '_xattrs->>' + dmk + ff + dmk + '=' + dm + query[ff] + dm + ' and '

	    }
	}
	
	wreq = wreq.substr(0, wreq.length-4);
	if(wreq === ' wh') wreq = '';

//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
// THIS IS WHERE TO PUT SORTED BY, LIMITS
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
	var oreq = '';

	var treq = qreq + wreq + ';';

	pg.connect(conop, function(err, client, done) {
	    if(err) return res.json({err:err});
	    client.query(treq, function(err, result) {
		if(err) console.log(err);
		done();

		//loop unpack xattrs
		for(var i=result.rows.length; i-->0;){
		    if(!(schemaName+'_xattrs' in result.rows[i])) continue;
		    for(var ff in result.rows[i][schemaName+'_xattrs']){
			result.rows[i][ff] = result.rows[i][schemaName+'_xattrs'][ff];
		    }
		    delete result.rows[i][schemaName+'_xattrs'];
		}
		return callback(err, (result||{rows:[]}).rows);
	    });

	});
	
    };


    pg.schemaVerify = function(){

	// make sure there aren't any fields called 'group' or 'user' or starts with $
	// make sure all jointypes exist
	
    };



    pg.boot = function(options, callback, errcallback){

	if(!errcallback) errcallback = callback;

// this needs option for not porting data
// and a check for isNewTable?

// maybe later a check for column rename (or simply an option)

// run a schema verify to check that the names are valid, there's a primary serial key, etc

	pg.connect(conop, function(err, client, done) {
	    if(err) return errcallback({err:err});

	    var rs = 0;
	    for(var tt in schemas.db) ++rs;
	    var rc = rs;

	    var errs = [];
	    
	    for(var tt in schemas.db){
		
		(function(sn){// sn === tt

		    var sc = schemas.db[sn];

		    client.query('select * from '+sc.tableName, function(selerr, oldrowres) {
			if(selerr && options.throwSelect) errcallback({select_err:selerr});
			client.query('drop table '+sc.tableName, function(drerr, result){
			    if(drerr && options.throwDrop) errcallback({drop_err:drerr});
			    
			    var oldrows = (oldrowres||{rows:[]}).rows;
			    
			    var qq = 'create table if not exists '+sc.tableName+' (';
			    for(var ff in sc.fields){
				qq += ff +' '+ sc.fields[ff].type+',';
			    }
			    for(var ff in schemas.defaultFields){
				qq += sn+'_'+ff +' '+ schemas.defaultFields[ff].type+',';
			    }
			    qq = qq.substr(0,qq.length-1) + ');';

			    // make the request
			    (function(qu, oldrows){
				client.query(qu, function(err, result) {
				    if(err){
					errs.push({err:err, query:qu});
					console.log(err);
				    }
				    var rem = oldrows.length;

				    if(!rem) if(!--rc){
					done();
		// think about returning successes and errors
					if(errs.length) return errcallback({errs:errs});
					return callback({db:schemas.db});
				    }

				    for(var i=oldrows.length; i-->0;){
					(function(d){
					    db.insert(sn, d, {}, function(err, ires){
						if(err){
						    errs.push({err:err});
						    console.log(err);
						}
						//count?
						if(!--rem) if(!--rc){
						    done();
	// think about returning successes and errors
						    if(errs.length) return errcallback({errs:errs});
						    return callback({db:schemas.db});
						}
					    });
					})(oldrows[i]);
				    }
				});
			    })(qq, oldrows);
			})
		    });
		})(tt);
	    }
	});
    };

    return pg;
}




// from .insert

/*
		//string
		if(schema.fields[ff].type.indexOf('varchar')>-1){
		    //if empty string put null
		    if((typeof query[ff] === 'undefined')||
		       ((JSON.stringify(query[ff]) === 'null')&&(query[ff] !== 'null'))){
			valreq += 'null,';
			continue;
		    }else if(!query[ff].length){
			valreq += 'null,';
			continue;
		    }

		    if(schema.fields[ff].type.indexOf('[')===-1){
			valreq += dm + query[ff] + dm + ',';
		    }

		    //array
		    else{
			if(!query[ff].length){
			    valreq += 'ARRAY[]::'+schema.fields[ff].type+',';
			}else{
			    valreq += 'ARRAY[';
			    for(var i=query[ff].length; i-->0;) valreq += dm + query[ff][i] + dm + ',';
			    valreq = valreq.substr(0, valreq.length-1);
			    valreq += '],';
			}
		    }
		}

		//timestamp
		else if(schema.fields[ff].type === 'timestamp'){
		    if(query[ff] === 'now()') valreq += dm + (new Date()).toISOString() + dm + ',';
		    else valreq += dm + (new Date(query[ff])).toISOString() + dm + ',';
		}

		//json
		else if(schema.fields[ff].type.indexOf('json')>-1){
		    if(schema.fields[ff].type.indexOf('[')===-1){
			valreq += dm + JSON.stringify(query[ff]) + dm + '::json,';	
		    }

		    //array
		    else{
			if(!query[ff]){
			    valreq += 'ARRAY[]::json[],';
			}else if(!query[ff].length){
			    valreq += 'ARRAY[]::json[],';
			}else{
			    valreq += 'ARRAY[';
			    for(var i=query[ff].length; i-->0;)
				valreq += dm + JSON.stringify(query[ff][i]) + dm + '::json,';
			    valreq = valreq.substr(0, valreq.length-1);
			    valreq += '],';
			}
		    }
		}

		// int/bool
		else{
		    if(schema.fields[ff].type.indexOf('[')===-1){
			valreq += '' + query[ff] + ',';
		    }

		    //array
		    else{
			if(!query[ff]){
			    valreq += 'ARRAY[]::'+schema.fields[ff].type+',';
			}else if(!query[ff].length){
			    valreq += 'null,';
			}else{
			    valreq += 'ARRAY[';
			    for(var i=query[ff].length; i-->0;) valreq += query[ff][i] + ',';
			    valreq = valreq.substr(0, valreq.length-1);
			    valreq += '],';
			}
		    }
		}
*/
