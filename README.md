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

todo

document return types:

insert (1 record, json)
upsert (array of objects updated)
read (array of objects read)

insertBatch (array of inserted objects)
...

emptydb
dropalltables

write some tests::


empty boot db

insert some records

read those records

update the records

((use charlatan to make some fake data))

((batch insert some records))

json-depth read

((join read))

((limit & sorted reads))

((erase some records))

((verifySchema))

----------------


fill in the docs

json depth filters (where json->'key'='val')

delete rows

schema verify schema cannot have anything called "group" or "user" or starting with a $

see if unpacking xattrs is possible from psql

pg.emptyboot

"order by" type queries

limit queries

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

transferring data in the instance of non-compatible type change

...
---


write tests & format for node module



...
---


writing into json

json updates are done as read+ write in psql 9.3

update in one query?