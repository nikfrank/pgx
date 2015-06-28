----------------
todo (code)
----------------

psql constraints (then upsert?)

psql foreign key (integrity constraint)

date comparisons

array push if not contains

where clause in xattrs/json (json depth reads)

with clause (join, depth join)

schema verify schema cannot have anything called "group" or "user" "from" "to" or starting with a $
(basically any postgres keyword is not allowed for schemaNames or tableNames

range queries

- regexps for strings

- range or modulo for numbers

file types in octo-data (adapter director)

array and json operators

- contains, not contains, contains at least N of [...]

- dereferenced array & object

'authors[0].name':{$like:'%Frank'}

'authors[2:5].name':{$like:'%Frank'}

'authors.name':{$like:'%Frank'}

'authors':{name:{$like:'%Frank'},location:'tel aviv'}

'authors':{$elemMatch:{name:{$like:'%Frank'},location:'tel aviv'} }

------------------

pgj

resolve schema based on _hash in object
-> if null, it is filled in for you, but you still got to be lazy
--> also this allows multischema batch inserts
