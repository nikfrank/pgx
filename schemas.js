module.exports = {
// these shouldn't be user accessable. they are built into the system
    defaultFields:{
	hash:{
	    type:'varchar(31)',
	    permissions:''
	},
	xattrs:{
	    type:'json',
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
		lang_hash:{
		    type:'varchar(31)',
		    permissions:'',
		    jointype:'lang',
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
		rule_hash:{
		    type:'varchar(31)',
		    permissions:'',
		    jointype:'rule'
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

	phrase:{
	    tableName:'api_phrase',
	    permissions:{
		// yet to define this field
	    },
	    fields:{
		phrase_id:{
		    type:'serial primary key',
		    permissions:''
		}
	    }
	},

	tln:{
	    tableName:'api_tln',
	    permissions:{
		// yet to define this field
	    },
	    fields:{
		tln_id:{
		    type:'serial primary key',
		    permissions:''
		}
	    }
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
		lang_hash:{
		    type:'varchar(63)',
		    permissions:'',
		    jointype:'lang',
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
		exps:{
		    type:'varchar(31)[]',
		    permissions:'',
		    jointype:'rule'
		},
		exp_match:{
		    type:'varchar(31)',
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
		    required:true
		},
		tag:{
		    type:'varchar(7)',
		    permissions:'',
		    required:true
		},
		verbconj:{
		    type:'json',
		    permissions:'',
		    required:true
		},
		otherconj:{
		    type:'json',
		    permissions:'',
		    required:true
		},
		alphabet:{
		    type:'json',
		    permissions:'',
		    required:true
		},
		transliteration:{
		    type:'json',
		    permissions:'',
		    required:true
		},
		textdir:{
		    type:'varchar(3)',
		    permissions:'',
		    defval:'ltr',
		    required:true
		}
	    }
	}

    },// </db>

    client:{
	schemas:{
	    word:{
		word_id:'serial id',
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
	    },

	    phrase:{
		
	    },

	    tln:{
		
	    },

	    rule:{
		
	    },

	    lang:{
		
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
