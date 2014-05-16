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


pg-flex (thats the new name) gives you:

db.read(schemaNameOrNames, queryParams, options, callback(err,data))
db.upsert(schemaNameOrNames, queryParams, options, callback(err,data))
db.insert(schemaNameOrNames, queryParams, options, callback(err,data))

** check these siggies. I'm doing this from memory **

** also document the options in each one **

** talk about how the xattrs field makes this feel like mongo **

** catchies:: 'group' 'user' **

** default fields, values **

** join type **


todo

write some tests
fill in the docs

read json
depth arrays?

-- xattr packing
function(schemaName, prev, nu)

writing into json
update in one query?

pg.emptyboot

"order by" type queries

delete rows
------------------------------

pointers to internally defined types (type||hash)

test boot & demo schema with ulp

returning (fields) on all requests instead of default *

transferring data in the instance of non-compatible type change