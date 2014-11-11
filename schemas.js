// take the hashes out of this.
// and everything with a serial key pleeeeeeeeeeeeeeeeez
// and permissions

module.exports = {
    word:{
	tableName:'api_word',
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
};
