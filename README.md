pgx odm for node- postgres (npm pg)
===

pgx makes PostgreSQL feel like NoSQL - but only when you want.

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

there's also the ability to define join types, which store a hash to join to. (finish & doc)

two default fields are defined on every table:

schemaName_hash: varchar(31) // hash assigned at creation, used for joins

schemaName_xattrs: json // used to hold data not fitting into the schema

do not overwrite these. it will throw postgres errors


see schemas.js for an example for a language app

("permissions" and "required" fields listed there are not implemented)




pgx.boot
===

    pgx.boot({}, function(a){ res.json(a); } );

pgx.boot copies data in existing tables, makes new tables to the schemas, replaces the data.

I put this in a get route, run it on update, then push the code again without the route
it should be idempotent, but I don't really trust it

there's probably a better solution (like checking and updating on require)

I think there'll be some options like if data should be retained, and there's gonna be
something like "data map" in case you changed the name of something.


pgx.boot has only one option "empty", which if true, will not transfer data - to boot an empty db



pgx gives you:

    pg.read(schemaNameOrNames, query, options, callback(err, data))

schemaNameOrNames = 'schemaName' for normal reads, ['schemaName1','schemaName2',..] for join reads

    pg.update(schemaName, input, options, callback(err, data))

input has format {where:{key:val,..}, data/query:{key:val,..}}

    pg.insert(schemaName, query, options, callback(err, dataInserted))

    pg.insertBatch(schemaName, [querys], options, callback(err, data))


    pg.boot(options, callback, errcallback)

    (( pg.erase(schemaName, query, options, callback(err, data)) ))
    (( pg.schemaVerify() ))

on the original pg object. unconventional? probably.

in addition to the original pg.connect -> client -> query -> ... routine

all of these can be called omitting the options param (not impl. yet)


you can write and read data not listed in your schemas

it gets written to a schemaName_xattrs json column, and unpackaged on read

basically it feels like MongoDB where you are unconstrained by your schema

except that the returning clause (in options) doesn't work for extended fields yet.
(listed as "json depth read" in todo code)


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


available on: read (not join)


offset
---

    {offset: number}

pass an offset clause to the read


available on: read (not join)


orderby
---

    {orderby: {col:'fieldname', order:'psql order type'}}
    {orderby: [{col:'fieldname', order:'psql order type'},..]}

pass an orderby clause or clauses to the read


available on: read (not join)


returning
---

    {returning: '*'}

this determines the values you're reading from the db and returning

obviously it's a good idea to use this to minimize the data read from cloud dbs

just pass it an array of strings of the column (field) names you want

currently does not work for extended attribute fields (TODO)


available on: read, read joined, everything?


valreqOnly
---

    {valreqOnly: false}

this is used internally (but available externally) to clip the returning clause from an
insert statement (and callback just the SQL string). It's used for lazying batch insert.


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

I don't think this is being tested right now, for json or json[] (TODO)


available on: update


throwSelect, throwDrop
---

    {throwSelect:false, throwDrop:false}

whether to throw errors in pgboot or just ignore them


available on: boot


empty
---

    {empty: false}

whether to make the new tables empty from pgboot


available on: boot


deleteLinked
---

unimplemented, as erase is unimplemented

    {deleteLinked: false}

in order to delete records linked by the hashing system


available on: (erase)


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

dev: false

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





todo (testing)
---

batchInsert test verify totals

pgboot using batch insert

data verify

document return types:

insert (1 record, json)

upsert (array of objects updated)

read (array of objects read)

...


empty boot db

insert some records

read those records

update the records

batch insert some records --> need in testdata.js

json-depth read

array $contains

((join read))

limit & sorted reads

((erase some records))

((verifySchema))

----------------
todo (code)
----------------

array push if not contains

returning clause from [within json, xattrs]

where clause in xattrs/json (json depth reads)

schema verify schema cannot have anything called "group" or "user" "from" "to" or starting with a $
(basically any postgres keyword is not allowed for schemaNames or tableNames

range queries

- regexps for strings

- range or modulo for numbers

diffs as a data type/schema option

array and json operators

- contains, not contains, contains at least N of [...]

- dereferenced array & object

'authors[0].name':{$like:'%Frank'}

'authors[2:5].name':{$like:'%Frank'}

'authors.name':{$like:'%Frank'}

'authors':{name:{$like:'%Frank'},location:'tel aviv'}

'authors':{$elemMatch:{name:{$like:'%Frank'},location:'tel aviv'} }


ideas
...


implement the useful parts of mongo syntax

this may involve writing actual psql routines and saving them from pg.boot

------------------------------


transferring data in the instance of non-compatible type change

...
---


write tests & format for node module



...
---

fix Date bug on pgboot transfer

writing into json

json updates are done as read+ write in psql 9.3

update in one query?

--------

stuff to doc


alias upsert, insertBatch

array $contains

$select sub query (also test)

big doc on schemas

big doc on queries

join reads, + test

--------

congratulations! you made it to the bottom. this is a lot of work.

I release this with no warranty, AS IS, you use it at your own risk

I think it's under the BSD 3 clause license, frankly as long as you don't
take undue credit for it do whatever you want.

I reserve the right to do whatever I want, including making breaking changes

the whole point of the npm version system is to allow me to do that, so don't complain.


this is clearly an ongoing project - there's a lot here that works and makes my life
easier, but it's a long way from being a polished (or even shiny at all) module.