pg wrap odm for node- postgres


docs:

boot process:

take a config pack, and require('pg')

    **copy line of actual code here**

config pack should have schemas

    **put example schemas here**

schemas can be extended as you please and passed around

db.boot

** fix it, add NoDataTransfer option, document **

throwSelect, throwDrop


pg-flex (thats the new name) gives you:

db.read(schemaNameOrNames, queryParams, options, callback(err,data))
db.upsert(schemaNameOrNames, queryParams, options, callback(err,data))
db.insert(schemaNameOrNames, queryParams, options, callback(err,data))

in addition to the original pg.connect -> client -> query -> ... routine

+ stringOnly option

** check these siggies. I'm doing this from memory **

** also document the options in each one **

** talk about how the xattrs field makes this feel like mongo **

** catchies:: 'group' 'user' **

** default fields, values **

** join type **

** options.returning **

"order by" type queries

limit queries

json depth filters (where json->'key'='val')

insertBatch (array of inserted objects)

todo

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