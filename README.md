pgx odm for node- postgres (npm pg)
===

pgx makes PostgreSQL feel like NoSQL - but only when you want.

(( note to the reader - things in double parens (as this note) are yet unimplemented ))

install::

    npm install pgx

---

    var pg = require('pg');
    var pgx = require('pgx')(pg, config.connection, schemas);

config.connection is for pg and is formatted as follows:

    {
    	conop:{
    	    user: 'nik',
    	    password: 'niksPassword',
    	    database: 'niksDatabase',
    	    host: 'localhost',
    	    port: 5432
    	}
    }

schemas can be extended as you please and passed around, they look like this:

    module.exports = {
        thing:{
    	    tableName:'niks_things',
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
    }

where this example is being "require"d then passed to pgx

the type field is a postgres type

defval is a default value passed directly to postgres

there's also the ability to define join types, which store a hash to join to (right now they do nothing though)

two default fields are defined on every table:

    {
        schemaName_hash: 'varchar(31)', // hash assigned at creation, used for joins
        
        schemaName_xattrs: 'json' // used to hold data not fitting into the schema
    }

do not overwrite these. it will throw postgres errors, you will find this sentence and it will explain your stupid

see schemas.js for an example for a language app

("permissions" and "required" fields listed there are not implemented)
this is a feature of these schemas - feel free to define whatever the hell you want on them, and then use
the schemas in a middleware to verify data, or filter based on column level permissions...


API
===
------


boot
---

    pgx.boot(options, function(a){ res.json(a); } );

pgx.boot copies data in existing tables, makes new tables to the schemas, replaces the data.

I put this in a get route, run it on update, then push the code again without the route
it should be idempotent, but I don't really trust it

you have to run this before doing anything, in order to create the tables in your database.

there's probably a better solution (like checking and updating on require)

pgx.boot options:

    {empty: false} // defaults to false tyvm

if true, boot will not transfer data - to boot an empty db

maps

    {maps: { schemaName: function(item){ return mappedItem; },.. } }

you can define a map function to run on each row of the data per schema


read
---

    pgx.read(schemaNameOrNames, query, options, callback(err, data))

schemaNameOrNames = 'schemaName' for normal reads, ['schemaName1','schemaName2',..] for multischema/(join) reads

update/upsert
---

    pgx.update(schemaName, input, options, callback(err, data))
    pgx.upsert(schemaName, input, options, callback(err, data))

input has format {where:{key:val,..}, data/query:{key:val,..}}

insert
---

    pgx.insert(schemaName, query, options, callback(err, dataInserted))

    pgx.insertBatch(schemaName, [querys], options, callback(err, data))

erase
---

    pgx.erase(schemaName, query, options, callback(err, data))

schemaVerify
---

    (( pgx.schemaVerify() ))

on the original pg object. unconventional? probably.

in addition to the original pg.connect -> client -> query -> ... routine

(( all of these can be called omitting the options param ))

you can write and read data not listed in your schemas

it gets written to a schemaName_xattrs json column, and unpackaged on read

basically it feels like MongoDB where you are unconstrained by your schema

except that the returning clause (in options) doesn't work for extended fields yet.

(listed as "json depth read" in todo code)


NO TABLE CAN BE CALLED 'schemas'. I use that.

examples
=======

simple read

    pgx.read('topic', {topic_hash: req.body.topic_hash}, {}, function(err, response){
        if(err) return res.status(400).json(err);
        return res.json(response);
    });

multischema read

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

multischema read only works for schema trees of depth 2 [rootSchema, leafSchemas,.. ]

I intend to rectify this, but it's a bit above my pay grade right now

for the love of your sanity, DO NOT put an empty POJO as a query. I'll fix that later.

(( currently unimplemented is the use of the 'join' sql word. multischema reads are done by implied outer join and are 
likely pretty slow ))


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

the callback will be passed the SQL string. I suppose it could also just return it but
I went with the callback to preserve the async stuff in case a json update requires a
read in order to make the SQL string.


available on: insert, read, ...


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

(( currently does not work for extended attribute fields ))


available on: read, read multischema, everything?


valreqOnly
---

    {valreqOnly: false}

this is used internally (but available externally) to clip the returning clause from an
insert statement (and callback just the SQL string). It's used for lazying batch insert.


available on: insert


stringSync
---

    {stringSync: false}

also used internally, will return the insert string synchronously


available on: insert


noinsert
---

    {noinsert: false}

this is on update (which is really upsert despite the name) which if true will sent a
noent error to the callback if there isn't an entry to update


available on: update


xorjson
---

    {xorjson: false}

if true will overwrite fields in json, false will overwrite the entire json

(( I don't think this is being tested right now, for json or json[] ))


available on: update


empty
---

    {empty: false}

whether to make the new tables empty from pgboot


available on: boot


maps
---

    {maps: {schemaName: {function(rowAsJson){ return mappedRow; } },.. } }

runs the javascript array map using the passed function on each row in the schema when transferring on reboot

use this if you rename a column, or want to edit some of the data


available on: boot


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

todo: from arrays, json?, join read

tests: {stringOnly:true} ish, {limit:3} ?, orderby ?

todo: {}, {field:val}, {jsonfield:{key:val}}, {xfield:val}, 
      {returning:['col1','col2']}, {returning:['col1','col2', 'xfield']},
      ['schema1', 'schema2']
docs:



update
---

dev: true

tests:

todo: {stringOnly:true}, {}, {noinsert:true}

docs:



insert
---

dev: true

tests: {stringOnly: true} ish, {} ish, {returning:[]} ish

tests should verify more data
returning test uses [] - needs to be verified with data

docs:



insertBatch
---

dev: true

tests: {strinOnly:true} ish, {} ish

docs:



erase
---

dev: true

tests: uidquery -> erase

docs:



boot
---

dev: true

tests: {empty:true}

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