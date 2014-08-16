pgx odm for node- postgres (npm pg)
===

pgx makes PostgreSQL feel like NoSQL - but only when you want.

install::

    npm install pgx


docs:

boot process:

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

    {
        defaultFields:{
    	    hash:{
    	        type:'varchar(31)',
    	        permissions:''
    	    },
    	    xattrs:{
    	        type:'json',
    	        defval:{}
    	    }
        },
        db:{
    	    domsnap:{
    	        tableName:'niks_things',
    	        fields:{
    		    whatever:{
    		        type:'json'
    		    },
    		    created:{
    		        type:'timestamp'
    		    }
    	        }
    	    }
        }
    }

This needs better documentation, and to stop using keys as values. sorry.

the type field is a postgres type

defval is a default value. yeah, I could've used camel case. sorry.

there's also the ability to define join types, which store a hash to join to.

that needs documentation

also, the default fields are very caked into everything, so at some point they'll cease 
to be optional

also, default types are prefixed with the schemaName, which is the key in the db object

db.boot

    pgx.boot({}, function(a){res.json(a);});

pgx.boot makes all the tables in the database.

I put this in a get route, run it on update, then push the code again without the route
it should be idempotent, but I don't really trust it

there's probably a better solution (like checking and updating on require)

I think there's some options like if data should be retained, and there's gonna be
something like "data map" in case you changed the name of something.


from here down needs cleanup
===

pgx gives you:


    pg.read(schemaNameOrNames, query, options, callback(err, data))

    pg.update(schemaName, input, options, callback(err, data))

input has format {where:{key:val,..}, data/query:{key:val,..}}

    pg.insert(schemaName, query, options, callback(err, data))
    pg.insertBatch(...)


    (( pg.erase(schemaName, query, options, callback(err, data)) ))
    (( pg.schemaVerify() ))

on the original pg object. unconventional? probably.

in addition to the original pg.connect -> client -> query -> ... routine

all of these can be called omitting the options param (check this)


you can write and read data not listed in your schemas

it gets written to a schemaname_xattrs json column, and unpackaged on read

basically it feels like MongoDB where you are constrained by your schema


options
-------

stringOnly
---

    {stringOnly: false}

the callback will be passed the SQL string. I suppose it could also just return it but
I went with the callback to preserve the async stuff in case a json update requires a
read in order to make the SQL string.


limit
---

    {limit: number}

pass a limit clause to the read


offset
---

    {offset: number}

pass an offset clause to the read


orderby
---

    {orderby: {col:'fieldname', order:'psql order type'}}
    {orderby: [{col:'fieldname', order:'psql order type'},..]}

pass an orderby clause or clauses to the read


returning
---

    {returning: '*'}

this determines the values you're reading from the db and returning

obviously it's a good idea to use this to minimize the data read from cloud dbs

just pass it an array of strings of the column (field) names you want

currently does not work for extended attribute fields (TODO)


valreqOnly
---

    {valreqOnly: false}

this is used internally (but available externally) to clip the returning clause from an
insert statement (and callback just the SQL string). It's used for lazying batch insert.


noinsert
---

    {noinsert: false}

this is on update (which is really upsert despite the name) which if true will sent a
noent error to the callback if there isn't an entry to update


xorjson
---

    {xorjson: false}

if true will overwrite fields in json, false will overwrite the entire json

I don't think this is being tested right now, for json or json[] (TODO)


throwSelect, throwDrop
---

    {throwSelect:false, throwDrop:false}

whether to throw errors in pgboot or just ignore them


empty
---

    {empty: false}

whether to make the new tables empty from pgboot


deleteLinked
---

unimplemented, as erase is unimplemented

    {deleteLinked: false}

in order to delete records linked by the hashing system

---
---



api dev testing and doc progress
---

pg.
===

read
---

dev: true

tests: basic, stringOnly, 

docs:



update
---

dev: true

tests:

docs:



insert
---

dev: true

tests:

docs:



insertBatch
---

dev: true

tests:

docs:



erase
---

tests:

docs:



boot
---

dev: true

tests:

docs:



verifySchema
---

tests:

docs:





** catchies:: 'group' 'user' **

** default fields, values **

** join type **

json depth filters (where json->'key'='val')

todo
---

batchInsert verify totals

pgboot using batch insert

data verify

document return types:

insert (1 record, json)
upsert (array of objects updated)
read (array of objects read)

...

write some tests::

empty boot db

insert some records

read those records

update the records

batch insert some records --> need in testdata.js

json-depth read

((join read))

limit & sorted reads

((erase some records))

((verifySchema))

----------------
todo:
----------------


schema verify schema cannot have anything called "group" or "user" or starting with a $

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
...
implement the useful parts of mongo syntax

this may involve writing actual psql routines and saving them from pg.boot
------------------------------

make xattrs and hash default behaviour, move them out of defaultsFields
this is just part of the odm. don't like it? don't use pgx

------------------------------

transferring data in the instance of non-compatible type change

...
---


write tests & format for node module



...
---


writing into json

json updates are done as read+ write in psql 9.3

update in one query?

--------
--------

congratulations! you made it to the bottom. this is a lot of work.

I release this with no warranty, AS IS, you use it at your own risk

I think it's under the BSD 3 clause license, frankly as long as you don't
take undue credit for it do whatever you want.

I reserve the right to do whatever I want, including making breaking changes

the whole point of the npm version system is to allow me to do that, so don't complain.


this is clearly an ongoing project - there's a lot here that works and makes my life
easier, but it's a long way from being a polished (or even shiny at all) module.