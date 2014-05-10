var crypto = require('crypto');

// todo in this file:
// read query into json
//depth arrays?


//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
// all pg.connect queries need to be reviewed and converted to prepared statements
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------

var dmfig = function(s){
    // determine the first delimiter of style $N$ which isnt present
    var n=0;
    var S = JSON.stringify(s);
    while( (new Regexp('$'+n+'$')).test(S) ) ++n;
    return '$'+n+'$';
};


module.exports = function(pg, conop, schemas){

    pg.conop = conop;
    pg.schemas = schemas;
    
    pg.insert = function(schemaName, query, options, callback){
	
	var qreq = 'insert into api_'+schemaName+' (';
	var valreq = ') values (';

	var schema = schemas.db[schemaName];

	if(!('hash' in query)){
	    // make up a hash
            var hmac = crypto.createHmac("sha1", "the toronto maple leafs are garbage"); 
            var hash2 = hmac.update(''+((new Date()).getTime())+''+Math.random());
            var digest = hmac.digest(encoding="base64");

	    query.hash = digest;//28chars
	}

//extend this for multidim arrays?
	for(var ff in schema.fields){
	    if(ff === 'xattrs') continue;
	    if(!(ff in query)) if('defval' in schema.fields[ff]) query[ff] = schema.fields[ff].defval;

	    if(ff in query){
		qreq += ff + ',';
		
		var dm = dmfig(query[ff]);

		if(schema.fields[ff].type.indexOf('varchar')>-1){
		    //string
		    //if empty string put null
		    if((typeof query[ff] === 'undefined')||
		       ((JSON.stringify(query[ff]) === 'null')&&(query[ff] !== 'null'))){
			valreq += 'null,';
			continue;
		    }

// there might be some bugs relating to pulling null out of the db. keep these here in the meantime
		    if(!query[ff].length){
			valreq += 'null,';
			continue;
		    }

		    if(schema.fields[ff].type.indexOf('[')===-1){
			valreq += dm + query[ff] + dm + ',';
		    }else{
			//array
			if(!query[ff].length){
			    valreq += ',';
			}else{
			    valreq += 'ARRAY[';
			    for(var i=query[ff].length; i-->0;) valreq += dm + query[ff][i] + dm + ',';
			    valreq = valreq.substr(0, valreq.length-1);
			    valreq += '],';
			}
		    }


		}else if(schema.fields[ff].type === 'timestamp'){
		    //timestamp
		    if(query[ff] === 'now()') valreq += dm + (new Date()).toISOString() + dm + ',';
		    else valreq += dm + (new Date(query[ff])).toISOString() + dm + ',';


		}else if(schema.fields[ff].type.indexOf('json')>-1){
		    //json
		    if(schema.fields[ff].type.indexOf('[')===-1){
			valreq += dm + JSON.stringify(query[ff]) + dm + '::json,';	
		    }else{
			//array
			if(!query[ff]){
			    valreq += 'ARRAY[]::json[],';
			}else if(!query[ff].length){
			    valreq += 'ARRAY[]::json[],';
			}else{
			    valreq += 'ARRAY[';
			    for(var i=query[ff].length; i-->0;) valreq += dm + JSON.stringify(query[ff][i]) + dm + '::json,';
			    valreq = valreq.substr(0, valreq.length-1);
			    valreq += '],';
			}
		    }


		}else{
		    // int/bool
		    if(schema.fields[ff].type.indexOf('[')===-1){
			valreq += '' + query[ff] + ',';
		    }else{
			//array
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
	    }
	}

	//put the other fields of query into xattrs if any
	var isx = false;
	var xat = {};
	if('xattrs' in query){
	    xat = query.xattrs;

	    isx = (JSON.stringify(xat).length>2)
	}

	for(var ff in query){
	    if(ff === 'xattrs') continue;

	    if(!(ff in schema.fields)){
		// put into xattrs
		isx = true;
		xat[ff] = query[ff];
	    }
	}
	if(isx){
	    qreq += 'xattrs,';

	    var dm = dmfig(xat);
	    valreq += dm + JSON.stringify(xat) + dm +'::json,';// json of xat
	}

	if(qreq.length === 21) return callback({err:'nodata'});

	qreq = qreq.substr(0, qreq.length-1);
	valreq = valreq.substr(0, valreq.length-1);

	var treq = qreq + valreq + ') returning *;';// option for return value

//document this
	if(options) if(options.justString) return treq;

	pg.connect(conop, function(err, client, done) {
	    if(err) return res.json({err:err});

	    client.query(treq, function(ierr, ires){
		//insert value to API_sch
		done();
		return callback(ierr, ires);
	    });
	});

    };


    pg.update = function(schemaName, input, options, callback){
	
	var qreq = 'update api_'+schemaName+' set ';
	var wreq = ' where ';

	var where = input.where;
	var query = input.data;

	var schema = schemas.db[schemaName];
	
//slap together wreq out of the where collection
// this obv only works for string and number queries right now

//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
// THIS IS WHERE TO PUT DEPTH READING
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------


	for(var ff in where){
	    if(typeof where[ff] === 'string') wreq += ff + '=\'' + where[ff] + '\' and ';
	    if(typeof where[ff] === 'number') wreq += ff + '=' + where[ff] + ' and ';
	}
	wreq = wreq.substr(0, wreq.length-4);

	// maybe only select what's being updated
	var sreq = 'select * from api_'+schemaName+wreq+';';

// select the record, which for now should be unique

	pg.connect(conop, function(err, client, done) {
	    if(err) return res.json({err:err});
	    client.query(sreq, function(serr, sres){

		if(!sres.rows.length){

		    done();

 // check if insert is allowed
		    if(options.noinsert){
			return callback({err:'noent', where:where});
		    }

		    //put query and where together
		    var qq = {};
		    for(var ff in query) qq[ff] = query[ff];
		    for(var ff in where) qq[ff] = where[ff];

		    return pg.insert(schemaName, qq, options, callback);
		    //return callback({err:'noent'});
		}

		var doc = sres.rows[0];

		//extend this for multidim arrays?
		for(ff in query){
		    if(ff === 'xattrs') continue;
		    if(!(ff in schema.fields)) continue;
		    qreq += ff + '=';
		    var dm = dmfig(query[ff]);

		    if(schema.fields[ff].type.indexOf('varchar')>-1){
			//string
			//if empty string put null
			if(!query[ff]){
			    qreq += 'null,';
			    continue;
			}else if(!query[ff].length){
			    qreq += 'null,';
			    continue;
			}

			if(schema.fields[ff].type.indexOf('[')===-1){
			    qreq += dm + query[ff] + dm + ',';
			}else{
			    //array
			    if(!query[ff].length){
				qreq += 'ARRAY[]::'+schema.fields[ff].type+',';
			    }else{
				qreq += 'ARRAY[';
				for(var i=query[ff].length; i-->0;) qreq += dm + query[ff][i] + dm + ',';
				qreq = qreq.substr(0, qreq.length-1);
				qreq += '],';
			    }
			}


		    }else if(schema.fields[ff].type === 'timestamp'){
			//timestamp
			qreq += dm + query[ff] + dm + ',';
			
		    }else if(schema.fields[ff].type.indexOf('json')>-1){
			//json
			if(schema.fields[ff].type.indexOf('[')===-1){
			    qreq += dm + JSON.stringify(query[ff]) + dm + '::json,';	
			}else{
			    //array
			    if(!query[ff].length){
				qreq += 'ARRAY[]::json[],';
			    }else{
				qreq += 'ARRAY[';
				for(var i=query[ff].length; i-->0;) qreq += dm + JSON.stringify(query[ff][i]) + dm + '::json,';
				qreq = qreq.substr(0, qreq.length-1);
				qreq += '],';
			    }
			}
			
			
		    }else{
			// int/bool
			if(schema.fields[ff].type.indexOf('[')===-1){
			    qreq += '' + query[ff] + ',';
			}else{
			    //array
			    if(!query[ff]){
				qreq += 'null,';
			    }else if(!query[ff].length){
				qreq += 'null,';
			    }else{
				qreq += 'ARRAY[';
				for(var i=query[ff].length; i-->0;) qreq += query[ff][i] + ',';
				qreq = qreq.substr(0, qreq.length-1);
				qreq += '],';
			    }
			}
		    }
		}

		//put the other fields of query into xattrs if any
		var isx = false;
		var xat = doc.xattrs;
		for(var ff in query){
		    if(ff === 'xattrs') continue;
		    if(!(ff in schema.fields)){
			// put into xattrs
			isx = true;
			if(xat === null) xat = {};
			xat[ff] = query[ff];
		    }
		}
		if(isx){
		    qreq += 'xattrs=';
		    //determine delimiter
		    var dm = dmfig(xat);
		    qreq += dm + JSON.stringify(xat) + dm +'::json,';// json of xat
		}

		if(qreq.length === 21) return callback({err:'nodata'});

		qreq = qreq.substr(0, qreq.length-1);

		var treq = qreq + wreq + ' returning *;';// option for return value

		client.query(treq, function(ierr, ires){
		    //insert value to API_sch
		    done();
		    return callback(ierr, ires);
		});
	    });
	});
    };

    pg.read = function(schemaName, query, options, callback){

	// build a string (json op the xattrs), make a query

	var schema = schemas.db[schemaName];

// only read fields in options.fields?
	var qreq = 'select * from api_'+schemaName;
	var wreq = ' where ';

	for(var ff in query){
	    //int and string is easy as long as it is in the schema
	    // anything inside an array or json or not in the schema (in xattrs::json) more thinky
	    if(ff in schema.fields){
		if(typeof query[ff] === 'string') wreq += ff + '=\'' + query[ff] + '\' and ';
		else if(typeof query[ff] === 'number') wreq += ff + '=' + query[ff] + ' and ';
		//from array or json
	    }else{
		// from json


//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
// THIS IS WHERE TO PUT DEPTH READING
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
		
	    }
	}
	
	wreq = wreq.substr(0, wreq.length-4);

	if(wreq === ' wh') wreq = '';

	var treq = qreq + wreq + ';';

	pg.connect(conop, function(err, client, done) {
	    if(err) return res.json({err:err});
	    client.query(treq, function(err, result) {
	
		//loop through result.rows[i].xattrs[ff] -> result.rows[i][ff]
		for(var i=result.rows.length; i-->0;){
		    if(!('xattrs' in result.rows[i])) continue;
		    for(var ff in result.rows[i].xattrs){
			result.rows[i][ff] = result.rows[i].xattrs[ff];
		    }
		    delete result.rows[i].xattrs;
		}
		done();
		return callback(err, (result||{rows:[]}).rows);
	    });

	});
	
    };

    return pg;
}
