pgx orm for node
===

- postgres (npm pg)


pgx makes PostgreSQL feel like NoSQL - but only when you want.

[![Build Status](https://travis-ci.org/nikfrank/pgx.svg?branch=master)](https://travis-ci.org/nikfrank/pgx)

install::

    npm install pgx

---

    var pg = require('pg');
    var pgx = require('pgx')(pg, config.connection, schemas);

config.connection is for pg and is formatted as follows:

    module.exports = {
    	conop:{
    	    user: 'nik',
    	    password: 'niksPassword',
    	    database: 'niksDatabase',
    	    host: 'localhost',
    	    port: 5432
    	}
    };

schemas can be extended as you please and passed around, they look like this:

    module.exports = {
        thing:{
    	    tableName:'thing',
    	    fields:{
                whatever:{
                    type:'json'
                },
                created:{
                    type:'timestamp',
                    devfal:'now()'
                }
    	    }
        }
    };

where this example is being "require"d then passed to pgx

the type field is a postgres type

defval is a default value passed directly to postgres

((you'll see I define "jointype" on pointer fields. This is in anticipation of implementing a foreign keys feature))

two default fields are defined on every table:

    {
        schemaName_hash: 'varchar(31)', // hash assigned at creation, used for joins
        schemaName_xattrs: 'json' // used to hold data not fitting into the schema
    }

if you try to overwrite these, it will not work.


schemaName_hash field is filled in for you if not included in your insert statement

this is basically a foreign 


schemaName_xattrs stores fields you write which aren't part of the schema into a JSON object

on reading this data, it is flattened into the doc as if that data was part of the schema (feels like mongo)

so basically don't even think about it.


see the pschemas.js for an example


API
===
------

boot
---

    pgx.boot(options, function(a){ res.json(a); } );

pgx.boot copies data in existing tables, makes new tables to the schemas, replaces the data and saves the schemas
to a table called schemas (with one JSON column).

I put this in a get route, run it on update, then push the code again without the route
it should be idempotent, I'd probably back up production data if I were you.

you have to run this before doing anything, in order to create the tables in your database.


pgx.boot options:

    {empty: false} // defaults to false tyvm

if true, boot will not transfer data - to boot an empty db

((maps))

    {maps: { schemaName: function(item){ return mappedItem; },.. } }
    // not impl. haven't needed it, put it here to remember

you can define a map function to run on each row of the data per schema



all of the following can be called omitting the options param

insert
---

    pgx.insert(schemaName, document, options, callback(err, dataInserted))

    pgx.insertBatch(schemaName, [doc1, doc2,..], options, callback(err, data))


read
---

    pgx.read(schemaNameOrNames, query, options, callback(err, data))

schemaNameOrNames = 'schemaName' for normal reads, ['schemaName1','schemaName2',..] for multischema/(join) reads

(( the multischema reads are being rebuilt with the "WITH" keyword of postgres. they're a tad wonky right now ))


update/upsert
---

    pgx.update(schemaName, input, options, callback(err, data))
    pgx.upsert(schemaName, input, options, callback(err, data))

input has format {where:{key:val,..}, data/query:{key:val,..}}


erase
---

    pgx.erase(schemaName, query, options, callback(err, data))


schemaVerify
---

    (( pgx.schemaVerify() ))


on the original pg object. unconventional? probably.

in addition to the original pg.connect -> client -> query -> ... routine


examples
=======

simple read

    pgx.read('topic', {topic_hash: req.body.topic_hash}, {}, function(err, response){
        if(err) return res.status(400).json(err);
        return res.json(response);
    });

multischema read (!!! don't use this !!!)

    pgx.read(['lesson', 'topic'], {
        topic:{topic_hash:req.body.topic_hash},
        lesson:{topic:req.body.topic_hash},
        $on:[{topic:'topic_hash', lesson:'topic'}]
    
    }, {
        topic:{returning:['topic_hash', 'name', 'url']},
        lesson:{returning:['lesson_hash', 'name', 'topic', 'commit_hash']}
    
    }, function(err, response){
        // response contains lessons whose topic field matched req.body.topic_hash
        // with the topic grafted in place of the hash (which is stored in it's "topic" field)
        if(err) return res.status(400).json(err);
        return res.json(response);
    });

for the love of your sanity, DO NOT put an empty POJO as a query. I'll fix that later.

(( currently unimplemented is the use of the 'join' sql word. multischema reads are done by implied outer join and are 
likely pretty slow ... I'm rewriting this with WITH, so wait for that))


insert

    pgx.insert('msg', {
        text: req.body.text,
        thread: req.body.thread,
        frm: req.session.usr_hash,
        rcp: req.body.rcp

    }, {}, function(err, response){
        if(err) return res.status(400).json(err);
        return res.json(response);
    });


update

    pgx.update('usr', {
        where:{usr_hash:req.body.usr_hash},
        data:{teaching:req.body.teaching}

    }, {}, function(err, response){
        return res.json(response);
    });



options
-------

stringOnly
---

    {stringOnly: false}

the callback will be passed the SQL string.

available on: everything but boot

stringSync
---

    {stringSync: false}

the function will return the SQL string. This overrides stringOnly.

available on: insert


limit
---

    {limit: number}

pass a limit clause to the read


available on: read (not multischema)


offset
---

    {offset: number}

pass an offset clause to the read


available on: read (not multischema)


orderby
---

    {orderby: {col:'fieldname', order:'psql order type'}}
    {orderby: [{col:'fieldname', order:'psql order type'},..]}

pass an orderby clause or clauses to the read


available on: read (not multischema)


returning
---

    {returning: '*'}

this determines the values you're reading from the db and returning

obviously it's a good idea to use this to minimize the data read from cloud dbs

just pass it an array of strings of the column (field) names you want

also you can ask for fields not part of the schema. pgx does the psql-json work for you.


available on: read, read multischema, insert, update


valreqOnly
---

    {valreqOnly: false}

this is used internally (but available externally) to clip the returning clause from an
insert statement (and callback just the SQL string). It's used for lazying batch insert.


available on: insert - but don't use it.



noinsert
---

    {noinsert: false}

this is on update (which is really upsert despite the name) which if true will sent a
noent error to the callback if there isn't an entry to update

(( psql now has an upsert word that I'm looking into ))


available on: update


xorjson
---

    {xorjson: false}

if true will overwrite fields in json, false will overwrite the entire json

(( this isn't being tested right now, for json or json[] ))


available on: update





---
below here are notes for me
---



api dev testing and doc progress
---

pg.
===

read
---

dev: true

todo: from arrays, json?

tests: {stringOnly:true} ish, {limit:3} ?, orderby ?

todo: {}, {field:val}, {jsonfield:{key:val}}, {xfield:val}, 
      {returning:['col1','col2']}, {returning:['col1','col2', 'xfield']},
      ['schema1', 'schema2']
docs:



update
---

dev: true

tests: none active

todo: {stringOnly:true}, {}, {noinsert:true}

docs:



insert
---

dev: true

tests: stringOnly, basic use, return values [& from xattr]

docs: simple examples (copy more from tests)



insertBatch
---

dev: true

tests: basic use, stringOnly, return values

docs: examples in this file



erase
---

dev: true

tests: none active

docs:



boot
---

dev: true

tests: not really, but it works

docs:



verifySchema
---

dev: false

tests:

docs:








--------

congratulations! you made it to the bottom. this is a lot of work.

I release this with no warranty, AS IS, you use it at your own risk

I think it's under the BSD 3 clause license, frankly as long as you don't
take undue credit for it do whatever you want.

I reserve the right to do whatever I want, including making breaking changes

the whole point of the npm version system is to allow me to do that, so don't complain.


this is clearly an ongoing project - there's a lot here that works and makes my life
easier, but it's a long way from being a polished (or even shiny at all) module.