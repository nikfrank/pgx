// think about an (internally defined type & pointer) type, instead of using a scattershot varchar balagan

// type is the schema name, followed by a delimiter followed by the hashpointer (sch|$|sha|$|timestamp)
module.exports = {
    // write these up for use by pgboot and authM
    defaultFields:{
	xattrs:{
	    type:'json',
	    //permissions:'',//permissions the same as the serial key
	    defval:{}
	},
	hash:{
	    type:'varchar(31)',
	    permissions:''
	}
    },
    db:{
	word:{
	    tableName:'API_word',
	    permissions:{
		// yet to define this field
	    },
	    fields:{
		word_id:{
		    type:'serial primary key',
		    permissions:''
		},
		lang:{
		    type:'varchar(63)',
		    permissions:'',
		    defval:'',
		    required:true
		},
		type:{
		    type:'varchar(63)',
		    permissions:''
		},
		root:{
		    type:'varchar(63)',
		    permissions:'',
		    required:true
		},
		group:{
		    type:'varchar(63)',
		    permissions:''
		},
		conjRule:{
		    type:'varchar(63)',
		    permissions:''
		},
		conjExp:{
		    type:'json',
		    permissions:''
		},
		transformExp:{
		    type:'json[]',
		    permissions:''
		},
		created:{
		    type:'timestamp',
		    permissions:'',
		    defval:'now()'
		},
		updated:{
		    type:'timestamp',
		    permissions:'',
		    defval:'now()'
		},
		author:{
		    type:'varchar(31)',
		    permissions:''
		}
	    }// </fields>
	}
    },// </db>

    client:{
	schemas:{
	    word:{
		word_id:'serial id',
// think about an (internally defined type & pointer) type, instead of using a scattershot varchar balagan
		lang:'lang (to be pointer once programmed)',
		type:'grammatical type of the word',
		root:'unconjugated root',
		group:'conjugation group',
		conjRule:'rule used for this type (pointer)',
		conjExp:'regexp, diff of matched exceptions',
		transformExp:'array of matched transform exceptions',
		created:'time on creation',
		updated:'time on update',
		author:'user original author (pointer)'
	    }
	},// </schemas>

	routes:{
	    word:{
		get:{
		    params:{word_id:'or any other unique ID per word'},
		    response:{word:'JSON doc for requested word'},
		    examples:{},
		    txt:'use this route to get a word'
		},
		post:{
		    params:{
			word_id:'Unique ID per word [do not specify when creating word]',
			word:'see word_schema'
		    },
		    response:{word:'JSON doc of updated/created word'},
		    examples:{},
		    txt:'use this route to create or update a word'
		}
	    }
	},

	types:[
	    {money:'amount formatted as a float'},
	    {date:'date formatted as YYYY-MM-DD hh:mm:ss'},
	    {percent:'percentage formatted as a float (ie 0.9997 means 99.97%)'}
	]
    }// </client>
}
