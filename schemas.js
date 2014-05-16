module.exports = {
    // write these up for use by pgboot and authM
    defaultFields:{
	hash:{
	    type:'varchar(31)',
	    permissions:''
	}
    },
    db:{
	word:{
	    tableName:'api_word',
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
		grp:{
		    type:'varchar(63)',
		    permissions:''
		},
		conjrule:{
		    type:'varchar(63)',
		    permissions:''
		},
		conjexp:{
		    type:'json',
		    permissions:''
		},
		transform_exp:{
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
	},

	rule:{
	    tableName:'api_rule',
	    permissions:{
		// yet to define this field
	    },
	    fields:{
		rule_id:{
		    type:'serial primary key',
		    permissions:''
		},
		name:{
		    type:'varchar(63)',
		    permissions:'',
		    defval:'',
		    required:true
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
		grp:{
		    type:'varchar(63)',
		    permissions:''
		},
		conj:{
		    type:'json',
		    permissions:''
		},
		hasconj:{
		    type:'json',
		    permissions:''
		},
		transform:{
		    type:'json',
		    permissions:''
		},
		exps:{// this to be an array of pointers to rules
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
	},

	lang:{
	    tableName:'api_lang',
	    permissions:{
		// yet to define this field
	    },
	    fields:{
		lang_id:{
		    type:'serial primary key',
		    permissions:''
		},
		name:{
		    type:'varchar(63)',
		    permissions:'',
		    defval:'',
		    required:true
		},
		tag:{
		    type:'varchar(7)',
		    permissions:'',
		    defval:'',
		    required:true
		},
		verbconj:{
		    type:'json[]',
		    permissions:'',
		    defval:'',
		    required:true
		},
		otherconj:{
		    type:'json[]',
		    permissions:'',
		    defval:'',
		    required:true
		},
		alphabet:{
		    type:'json',
		    permissions:'',
		    defval:'',
		    required:true
		},
		transliteration:{
		    type:'json',
		    permissions:'',
		    defval:'',
		    required:true
		},
		textdir:{
		    type:'varchar(3)',
		    permissions:'',
		    defval:'',
		    required:true
		}
	    }
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
