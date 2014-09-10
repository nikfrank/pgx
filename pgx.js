var crypto = require('crypto');
var btoa = require('btoa');

module.exports = function(pg, conop, schemas){

    var defaultFields = {
	hash:{
	    type:'varchar(31)'
	},
	xattrs:{
	    type:'json',
	    defval:{}
	}
    };


    pg.conop = conop;
    pg.schemas = schemas;
    
    pg.insert = function(schemaName, query, options, callback){
	
	var schema = schemas[schemaName];

	var qreq = 'insert into '+schema.tableName+' (';
	var valreq = ') values (';

	if(!((schemaName+'_hash') in query)){
	    // make up a hash
            var hmac = crypto.createHmac("sha1", "the toronto maple leafs are garbage"); 
            var hash2 = hmac.update(''+((new Date()).getTime())+''+Math.random());
            var digest = hmac.digest(encoding="base64");

	    query[schemaName+'_hash'] = digest;//28chars good enough
	}

	// build the insert statement
	for(var ff in schema.fields){
	    if(ff === schemaName+'_xattrs') continue;
	    if(ff === schemaName+'_hash') continue;
	    if(!(ff in query))
		if('defval' in schema.fields[ff]) query[ff] = schema.fields[ff].defval;

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
	    if(ff === schemaName+'_hash') continue;
	    if(!(ff in schema.fields)) xat[ff] = query[ff];
	}
	if(JSON.stringify(xat).length>2){
	    qreq += schemaName+'_xattrs,';
	    var dm = dmfig(xat);
	    valreq += dm + JSON.stringify(xat) + dm +'::json,';
	}

	// hash field
// these default fields shouldn't be using magic code like this
// these default fields shouldn't be using magic code like this
// these default fields shouldn't be using magic code like this
// these default fields shouldn't be using magic code like this

// also, move all the valreq stuff earlier to omit the rest on valreq only reqs

	qreq += schemaName+'_hash,';
	var dm = dmfig(query[schemaName+'_hash']);
	valreq += dm + query[schemaName+'_hash'] + dm +',';

	if(qreq.length === 21) return callback({err:'nodata'});

	qreq = qreq.slice(0,-1);
	valreq = valreq.slice(0,-1);

	if(options.valreqOnly) return callback(undefined, {qreq:qreq, valreq:valreq.substr(9)});

	var rreq = fmtret(options.returning);
	var treq = qreq + valreq + ') returning '+rreq+';';

	if(options.stringOnly) return callback(undefined, treq);

	pg.connect(conop, function(err, client, done) {
	    if(err) return callback({connection_err:err});

	    client.query(treq, function(ierr, ires){
		done();

		var retres = (ires||{rows:[]}).rows[0];

		// flatten xattrs here
		if(schemaName+'_xattrs' in retres){
		    for(var ff in retres[schemaName+'_xattrs'])
			retres[ff] = retres[schemaName+'_xattrs'][ff];
		    delete retres[schemaName+'_xattrs'];
		}

		return callback(ierr, retres);
	    });
	});
    };


    pg.batchInsert = function(schemaName, queryArray, options, callback){
	
	var schema = schemas[schemaName];

	var qreq = 'insert into '+schema.tableName+' (';

	var valreq = ') values ';

	var rreq = fmtret(options.returning);

	var foroptions = options;
	foroptions.valreqOnly = true;

	var rem = queryArray.length;

	var callDB = function(){
	    var treq = qreq + valreq + ' returning '+rreq+';';

	    if(options.stringOnly) return callback(undefined, treq);

	    pg.connect(conop, function(err, client, done) {
		if(err) return callback({connection_err:err});

		client.query(treq, function(ierr, ires){
		    done();
		    return callback(ierr, (ires||{rows:[]}).rows);
		});
	    }); 
	};

	// loop over queryArray, adding values () blocks for each one
	for(var i=0; i<queryArray.length; ++i){
	    pg.insert(schemaName, queryArray[i], foroptions, function(err, strs){
		valreq += strs.valreq + '),';
		qreq = strs.qreq;
		if(!--rem){
		    valreq = valreq.slice(0,-1);
		    callDB();
		}
	    });
	}
    };

    pg.insertBatch = pg.batchInsert;

    pg.update = function(schemaName, input, options, callback){
	

// if there's no json or xattrs, this should be done in one request
// that would require me to know what I was doing with postgres tho!

	var schema = schemas[schemaName];

	var qreq = 'update '+schema.tableName+' set ';

	var where = input.where;
	var query = input.data||input.query;

	var wreq = fmtwhere(schemaName, where);
	if(wreq === '') return callback({err:'no where clause available'});

	var urreq = '*';
	// loop through query and where to grab only fields requested

	var sreq = 'select '+urreq+' from '+schema.tableName+wreq+';';

	// select the record
	pg.connect(conop, function(err, client, done) {
	    if(err) return callback({err:err});
	    client.query(sreq, function(serr, sres){
		if(serr) return callback({err:serr, req:sreq});

		// insert if n'exist pas
		if(!sres.rows.length){
		    done();

		    if(options.noinsert){
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
		    var old;

		    if(schema.fields[ff].type.indexOf('json')>-1)
			if(options.xorjson) old = doc[ff];

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

		qreq = qreq.slice(0,-1);

		var rreq = fmtret(options.returning);
		var treq = qreq + wreq + ' returning '+rreq+';';

		if(options.stringOnly) return callback(undefined, treq);

		client.query(treq, function(ierr, ires){
		    var ep;
		    if(ierr) ep = {err:ierr, stmt:treq};

		    done();

		    if(ep) callback(ep);

		    var retres = (ires||{rows:[]}).rows[0];

		    // flatten xattrs here
		    if(schemaName+'_xattrs' in retres){
			for(var ff in retres[schemaName+'_xattrs'])
			    retres[ff] = retres[schemaName+'_xattrs'][ff];
			delete retres[schemaName+'_xattrs'];
		    }

		    return callback(ierr, retres);

		});
	    });
	});
    };

    pg.upsert = pg.update;


    pg.read = function(schemaNameOrNames, query, options, callback){

	if(schemaNameOrNames.constructor == Array){
//-----------------------------------------------------------------------------------------
// JOIN READS
//-----------------------------------------------------------------------------------------
//
//  ['s1','s2'], { s1:{query}, s2:{query}, $on:['stmt'] },
//  {schema1:{options}, schema2:{options} }
//
// $on: [['s1','c1','op','s2','c2'],..]?

// $on: [{s1:'col'||hash, s2:'col'||hash, $op: 'w/e' || '=' / '@>' }]
// pgx would then have to either
// guess = if the join type makes sense
// guess @> or <@ if one is a [] from schemaType
// if both are [], use the $op field

// some operators require bracketing of the second operand
	    
	    //   query should be split by schema
	    //   select s1.returning,s2.returning from s1.tn join s2.tn on join-column1=join-column2
	    //      where s1.where and s2.where limit # offset # orderby s2.col asc;
	    //
	    //   select s1.ret, s2.ret from s1.tn, s2.tn where (join clause) and (other where clauses)
	    //
	    //-----------------------------------------------------------------------------------------

	    var schemae = schemaNameOrNames;//lazy... nice use of both plurals


	    var areq = 'select row_to_json(stat) from (';
	    var breq = ') stat';

	    // compute returning clauses
	    var rreq = '';
	    
	    // fmt ret with tablePrefix
	    // as schemaName__whatever

// if returning is empty, replace with everything
// always return the hashes

	    for(var i=0; i<schemae.length; ++i)
		rreq += fmtret(options[schemae[i]].returning, schemae[i], true) + ',';

	    rreq = rreq.slice(0,-1);

	    var roots = schemae[0]; // document this!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	    var jreq = ' where ';

	    // make the return tree structure

	    for(var i=query.$on.length; i-->0;){
		for(var ff in query.$on[i]){

		    if(ff === roots){
			query.$on[i].supers = ff;
		    }else if((schemas[ff].fields[query.$on[i][ff]]||{type:''})
			     .type.indexOf('[]') !== -1){
			query.$on[i].supers = ff;

		    }else{
			query.$on[i].subs = ff;
		    }
		}
	    }
	    
	    var tree = {};
	    tree[roots] = {};

	    // this is depth first recursion.
	    var placeontree = function(ptr, tilt){
		
		var keys = Object.keys(ptr);

		for(var j=keys.length; j-->0;){

		    if(keys[j] === tilt.supers){
			// put tilt[tilt.subs] as the key, tilt.subs as the type
			if(!ptr[tilt.supers]) ptr[tilt.supers] = {};
			ptr[tilt.supers][tilt[tilt.supers]] = {};
			ptr[tilt.supers][tilt[tilt.supers]][tilt.subs] = {};
			return true;

		    }else if(!Object.keys(ptr[ keys[j] ]).length){
			continue;

		    }else{
			if(placeontree(ptr[keys[j]][Object.keys(ptr[keys[j]])[0]], tilt))
			    return true;
		    }
		}
		return false;
	    };

	    var placed = 0;
	    for(var it = 0; placed < query.$on.length; it = (++it) % query.$on.length){
		if(query.$on[it].placed) continue;

		if(placeontree(tree, query.$on[it])){
		    query.$on[it].placed = true;
		    placed++;
		}
	    }

	    // finish the sql, ...
	    // now that we have the sub and super on each one, deciding on an op should be easy?
	    for(var i=query.$on.length; i-->0;){
		var q = query.$on[i];

		// two options: = or = any (...)
		if(schemas[q.supers].fields[q[q.supers]].type.indexOf('[]') !== -1){
		    jreq += schemas[q.subs].tableName+'.'+q[q.subs]+
			' = any ('+schemas[q.supers].tableName+'.'+q[q.supers]+') and ';

		}else{
		    jreq += schemas[q.subs].tableName+'.'+q[q.subs]+
			' = '+schemas[q.supers].tableName+'.'+q[q.supers]+' and ';

		}
	    }

	    for(var i=0; i<schemae.length; ++i)
		if(query[schemae[i]])
		    jreq = fmtwhere(schemae[i], query[schemae[i]], jreq) + ' and ';

	    if(jreq.substr(-4,4) === 'and ') jreq = jreq.slice(0,-4);

	    var qreq = 'select '+rreq+' from ';
	    for(var i=0; i<schemae.length; ++i) qreq += schemas[schemae[i]].tableName + ',';
	    qreq = qreq.slice(0,-1);

// impl oreq here... reimp as fmtoreq

	    var treq = areq + qreq + jreq + breq + ';';

	    if(options.stringOnly) return callback(null, treq);


	    pg.connect(conop, function(err, client, done) {
		if(err) return res.json({err:err});
		client.query(treq, function(err, result) {
		    if(err) console.log(err);
		    done();

		    if(!result) return callback(err?{err:err, sql:treq}:undefined, []);
		    if(!result.rows) return callback(err?{err:err, sql:treq}:undefined, []);
		    if(!result.rows.length) return callback(err?{err:err, sql:treq}:undefined, []);
		    
		    for(var i=result.rows.length; i-->0;)
			result.rows[i] = result.rows[i].row_to_json;


//		    return callback(err, {tree:tree, result:result.rows});
   // flatten xattrs?
		    
		    // make an array of the subdocs
		    // take one example of each superdoc sans prefices
		    // replace the array with the subdocarray


		    var superdocs = [];
		    var sdi = {};

// this should compile an array of dissimilar root docs (index by hash)
		    for(var i=result.rows.length; i-->0;){
			var superdoc = {};
			for(var ff in result.rows[i])
			    if(roots.indexOf(ff.split('__')[0]) !== -1)
				superdoc[ff.split('__')[1]] = result.rows[i][ff];

			if(superdoc[roots+'_hash'] in sdi) continue;
			else{
			    sdi[superdoc[roots+'_hash']] = superdocs.length;
			    superdocs.push(superdoc);
			}
		    }

		    for(var i=result.rows.length; i-->0;){
			var pack = {};
			for(var ff in result.rows[i]){
			    if(!(ff.split('__')[0] in pack))
				if(ff.split('__')[0] !== roots)
				    pack[ff.split('__')[0]] = {};
			    if(roots.indexOf(ff.split('__')[0]) === -1){
				pack[ff.split('__')[0]][ff.split('__')[1]] = result.rows[i][ff];
			    }
			    else if(ff.split('__')[1] === roots+'_hash')
				pack.$superhash = result.rows[i][ff];
			}
			for(var gg in pack){
			    if(gg === '$superhash') continue;
			    // just push this onto the superdoc? for now. multidepth later

			    // gg is the schema of the subdoc we're attaching here
			    // find the key in tree[roots] whose key is gg

			    var treekey;
			    for(var tf in tree[roots]){
				if(Object.keys(tree[roots][tf])[0] === gg){
				    treekey = tf;
				    break;
				}
			    }

// here check if the field in the root schema is an array
			    if(schemas[roots].fields[treekey].type.indexOf('[]') === -1)
				superdocs[sdi[pack.$superhash]][treekey] = pack[gg];
			    else{
				var iin = superdocs[sdi[pack.$superhash]][treekey]
				    .indexOf(pack[gg][gg+'_hash']);
				superdocs[sdi[pack.$superhash]][treekey][iin] = pack[gg];
			    }
//test!

			}


		    }

		    return callback(err, superdocs);
		});
	    });

	    return;
	}

	var schemaName;
	if(typeof schemaNameOrNames === 'string') schemaName = schemaNameOrNames;
	var schema = schemas[schemaName];

	var rreq = fmtret(options.returning);

	var areq= '', breq = '';

	if(rreq !== '*'){
	    var areq = 'select row_to_json(stat) from (';
	    var breq = ') stat';
	}
	
	var qreq = 'select '+rreq+' from '+schema.tableName;
	var wreq = fmtwhere(schemaName, query);

	var oreq = '';

	if(typeof options.limit === 'number'){
	    if(options.limit < 1) throw new Error('limit of '+options.limit+' less than one');
	    oreq += ' limit '+options.limit;
	    if(typeof options.offset === 'number'){
		if(options.limit < 0) throw new Error('offset of '+options.offset+'less than zero');
		oreq += ' offset '+options.offset;
	    }else if(typeof options.offset !== 'undefined')
		throw new Error('offset should be a number, not a '+(typeof options.offset));
	}else if(typeof options.limit !== 'undefined')
	    throw new Error('limit should be a number, not a '+(typeof options.limit));

	if(typeof options.orderby === 'object'){ if(options.orderby.constructor == Array){
	    for(var ic=0; ic<options.orderby.length; ++ic){
		var cc = options.orderby[ic];
   //check that cc is in schema, otherwise use xattrs and only select where it exists?
		oreq += ' '+cc.col+' '+cc.order+',';
	    }
	    oreq = oreq.slice(0,-1);

	}else if(options.orderby.constructor == Object){
	    var cc = options.orderby;
   //check that cc is in schema, otherwise use xattrs and only select where it exists?
	    oreq += ' '+cc.col+' '+cc.order;
	}}

	var treq = areq + qreq + wreq + oreq + breq + ';';

	if(options.stringOnly) return callback(null, treq);


	pg.connect(conop, function(err, client, done) {
	    if(err) return res.json({err:err});
	    client.query(treq, function(err, result) {
		if(err) console.log(err);
		done();

		if(rreq !== '*'){
		    for(var i=(result.rows||[]).length; i-->0;){
			result.rows[i] = result.rows[i].row_to_json;
		    }
		}

		//loop unpack xattrs
		for(var i=(result.rows||[]).length; i-->0;){
		    if(!(schemaName+'_xattrs' in result.rows[i])){
			continue;
		    }
		    for(var ff in result.rows[i][schemaName+'_xattrs'])
			result.rows[i][ff] = result.rows[i][schemaName+'_xattrs'][ff];
		    delete result.rows[i][schemaName+'_xattrs'];
		}
		return callback(err, (result||{rows:[]}).rows);
	    });
	});
    };


    pg.erase = function(schemaName, query, options, callback){

	var schema = schemas[schemaName];

	if(options.deleteLinked){
	    //delete all autojoined records too
	    return callback(undefined, undefined);
	}
	// else, simply erase those records fields
	var ereq = 'delete from ' + schema.tableName;

 	var wreq = fmtwhere(schemaName, query);

	var treq = ereq + wreq + ';';

	pg.connect(conop, function(err, client, done) {
	    if(err) return res.json({err:err});
	    client.query(treq, function(err, result) {
		if(err) console.log(err);
		done();

		return callback(err, result);
	    });
	});

    };


    pg.schemaVerify = function(){
	// make sure there aren't any fields called 'group' or 'user' or starts with $
	// make sure all jointypes exist
	// make sure there's a primary serial key
	
    };


    pg.boot = function(options, callback, errcallback){
	if(!errcallback) errcallback = callback;

	// if is newtable, leave throwSelect and throwDrop false to not hack a chinak about it
	// maybe this should be an option to list new tables or renamed tables

	// option for column rename options.renames = {oldname:'newname',..}

	pg.connect(conop, function(err, client, done) {
	    if(err) return errcallback({err:err});

	    var rs = 0;
	    for(var tt in schemas) ++rs;
	    var rc = rs;

	    var errs = [];
	    
	    for(var tt in schemas){
		(function(sn){// sn === tt
		    var sc = schemas[sn];

		    client.query('select * from '+sc.tableName, function(selerr, oldrowres) {
			if(selerr && options.throwSelect) errcallback({select_err:selerr});
			client.query('drop table '+sc.tableName, function(drerr, result){
			    if(drerr && options.throwDrop) errcallback({drop_err:drerr});
			    
			    var oldrows = (oldrowres||{rows:[]}).rows;
			    if(options.empty) oldrows = [];
			    
			    var qq = 'create table if not exists '+sc.tableName+' (';
			    for(var ff in sc.fields){
				qq += ff +' '+ sc.fields[ff].type+',';
			    }
			    for(var ff in defaultFields){
				qq += sn+'_'+ff +' '+ defaultFields[ff].type+',';
			    }
			    qq = qq.slice(0,-1) + ');';

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
					return callback({db:schemas});
				    }
				    for(var i=oldrows.length; i-->0;){
					(function(d){
					    pg.insert(sn, d, {}, function(err, ires){
						if(err){
						    errs.push({err:err});
						    console.log(err);
						}
						//count?
						if(!--rem) if(!--rc){
						    done();
	// think about returning successes and errors
						    if(errs.length) return errcallback({errs:errs});
						    return callback({db:schemas});
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

function fmtwhere(schemaName, query, init){

    if(JSON.stringify(query) === '{}') return init||'';

    var schema = schemas[schemaName];
    var tt = schema.tableName+'.';
    var wreq = init || ' where ';

    for(var ff in query){
	if(ff in schema.fields){
	    if(query[ff].constructor == Array){

		if(schema.fields[ff].type.indexOf('[]') === -1) continue;

		// match the array?
		wreq += tt+ff + ' @> ARRAY[';
		for(var i=query[ff].length; i-->0;){
		    var dm = dmfig(query[ff][i]);
		    wreq += dm + query[ff][i] + dm + ', ';
		}
		wreq = wreq.slice(0,-2);
		wreq += ']::'+schema.fields[ff].type+' and '

		wreq += tt+ff + ' <@ ARRAY[';
		for(var i=query[ff].length; i-->0;){
		    var dm = dmfig(query[ff][i]);
		    wreq += dm + query[ff][i] + dm + ', ';
		}
		wreq = wreq.slice(0,-2);
		wreq += ']::'+schema.fields[ff].type+' and '


	    }else if(typeof query[ff] === 'object'){
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
		    if(kk[0] === '$'){
// document this!!!
			if(kk === '$in'){
			    if(query[ff][kk].constructor != Array) continue;

			    // where value in [val,..]
			    wreq += tt+ff + ' = any (ARRAY[';
			    for(var i=query[ff][kk].length; i-->0;){
				var dm = dmfig(query[ff][kk][i]);
				wreq += dm + query[ff][kk][i] + dm + ', ';
			    }
			    wreq = wreq.slice(0,-2);
			    wreq += ']::'+schema.fields[ff].type+'[]) and '

			}else if(kk === '$contains'){
			    if(schema.fields[ff].type.indexOf('[]') === -1) continue;

			    var dm = dmfig(query[ff][kk]);
			    wreq += dm + query[ff][kk] + dm + ' = any ('+tt+ff+') and ';

			}else if(kk === '$select'){
			    // this is probably a bad idea

			    //usr_fb_id: {$select: {schema:'usr', field:'usr_fb_id', where{...}}}

			    var ss = query[ff][kk].schema;

			    var ssf = query[ff][kk].field || ss+'_hash';
			    var sst = schemas[ss].tableName;

			    wreq += tt+ff + ' = any (select ' + ssf + ' from '+ sst +
				fmtwhere(ss, query[ff][kk].where) + ') and ';
			}
		    }else{
			var dmk = dmfig(kk);
			var dm = dmfig(query[ff][kk]);
			wreq += tt+ff+'->>' + dmk + kk + dmk + '=' + dm + query[ff][kk] + dm + ' and ';
			//formatas?
		    }
		}
	    }else{
		var dm = dmfig(query[ff]);
		wreq += tt+ff + '=' + formatas(query[ff], schema.fields[ff].type, dm) + ' and ';
	    }
	}
	else if(ff === schemaName+'_hash'){
	    if(typeof query[ff] === 'object'){
		for(var kk in query[ff]){
		    if(kk[0] === '$'){
// document this!!!
			if(kk === '$in'){
			    if(query[ff][kk].constructor != Array) continue;

			    // where value in [val,..]
			    wreq += tt+ff + ' = any (ARRAY[';
			    for(var i=query[ff][kk].length; i-->0;){
				var dm = dmfig(query[ff][kk][i]);
				wreq += dm + query[ff][kk][i] + dm + ', ';
			    }
			    wreq = wreq.slice(0,-2);
			    wreq += ']::varchar(31)[]) and '

			}else if(kk === '$select'){
			    // this is probably a bad idea

			    //topic_hash: {$select: {schema:'usr', field:'teaching', where{...}}}

// I dont know if this will work without flattening the result array of arrays

			    var ss = query[ff][kk].schema;

			    var ssf = query[ff][kk].field || ss+'_hash';
			    var sst = schemas[ss].tableName;

			    wreq += tt+ff + ' = any (select ' + ssf + ' from '+ sst +
				fmtwhere(ss, query[ff][kk].where) + ') and ';
			}
		    }
		}
	    }else{
		var dm = dmfig(query[ff]);
		wreq += tt+ff + '=' + formatas(query[ff], 'varchar(31)', dm) + ' and ';
	    }
	}
	// xattr reads
	else{   
	    var dmk = dmfig(ff);
	    var dm = dmfig(query[ff]);

	    wreq += tt+schemaName + '_xattrs->>' + dmk + ff + dmk + '=' + dm + query[ff] + dm + ' and '
	}
    }
    
    wreq = wreq.slice(0,-4);
    if(wreq.length < 11) wreq = '';// ' where a=1 ' is the shortest possible where clause

    return wreq;
}

function dmfig(s){
    // determine the first delimiter of style $N$ which isnt present
    if(typeof s === 'number') return '';
    var n=0;
    var S = JSON.stringify(s);
    var ns = btoa(''+((n-n%100)/100)+''+((n%100-n%10)/10)+''+n%10);

    while( (new RegExp('$'+ns+'$')).test(S) ){
	++n;
	ns = btoa(''+((n-n%100)/100)+''+((n%100-n%10)/10)+''+n%10);
    }
    return '$'+ns+'$';
}

function fmtret(rop, schemaName, withas){

    var prefix;
    if(schemaName) prefix = schemas[schemaName].tableName;
    var pfx = prefix || '';
    if(pfx) pfx += '.';

    var rreq = pfx+'*';

    if(rop) if(rop.length){
	if(typeof rop === 'string'){
	    // check if is in schema, if not prepend schemaName_xattrs->

	    rreq = pfx + rop;
	}else if(rop.constructor == Array){
	    rreq = '';
	    for(var i=0; i<rop.length; i++){
		// check if is in schema, if not prepend schemaName_xattrs->
		rreq += pfx + rop[i];

		if(withas) rreq += ' as ' + schemaName + '__' + rop[i];

		rreq +=  ',';
	    }
	    rreq = rreq.slice(0,-1);
	    rreq += '';
	}
    }
    return rreq;
}


function formatas(data, type, dm, old){
    var ret = '';

    //string
    if(type.indexOf('varchar') !== -1){ // grab varchar \d+ length and truncate?
	//if empty string put null
	if((typeof data === 'undefined')||((JSON.stringify(data) === 'null')&&(data !== 'null')))
	    return 'null';
	else if(!data.length) return 'null';

	if(type.indexOf('[')===-1) return (dm + data + dm);

	//array
	else{
	    if(!data.length) return ('ARRAY[]::'+schema.fields[ff].type);
	    else{
		ret += 'ARRAY[';
		for(var i=data.length; i-->0;) ret += dm + data[i] + dm + ',';
		ret = ret.slice(0,-1);
		ret += ']';
		
		return ret;
	    }
	}
    }
    //timestamp
    else if(type === 'timestamp'){
	if(data === 'now()') return (dm + (new Date()).toISOString() + dm);
	else{
	    console.log(data);
	    console.log((dm + (new Date(data)).toISOString() + dm));
	    return (dm + (new Date(data)).toISOString() + dm);
	}
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
		ret = ret.slice(0,-1);
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
		ret = ret.slice(0,-1);
		ret += ']';
		
		return ret;
	    }
	}
    }
}

}
