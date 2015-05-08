// take the hashes out of this.
// and everything with a serial key pleeeeeeeeeeeeeeeeez
// and permissions



// add a field in each schema "relations"

// which reflects inpointers

module.exports = {
    word:{
	tableName:'api_word',
	fields:{
	    lang:{
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
	    rule:{
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
	    },
	    notes:{
		type:'text'
	    },
	    span:{
		type:'interval',
		defval:'00:00:00'
	    }
	}// </fields>
    },

    phrase:{
	tableName:'api_phrase',
	permissions:{
	    // yet to define this field
	},
	fields:{
	    notes:{
		type:'text'
	    }
	}
    },

    tln:{
	tableName:'api_tln',
	permissions:{
	    // yet to define this field
	},
	fields:{
	    notes:{
		type:'text'
	    }
	}
    },

    rule:{
	tableName:'api_rule',
	permissions:{
	    // yet to define this field
	},
	fields:{
	    name:{
		type:'varchar(63)',
		permissions:'',
		defval:'',
		required:true
	    },
	    lang:{
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
