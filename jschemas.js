// fields beginning with & are inpointers
// not actually part of the schema,
// rather a reflection of other schemae

// later there may be more complex (multi index) pointers to handle

module.exports = {
    person:{
	name:'text',
	fbid:'text', // unique
	country:'text',
	teachers:'*person[]',
	schools:'*school[]'
    },
    school:{
	name:'text',
	country:'text',
	teachers:'*person[]',
	students:'*person[]'
    },
    testres:{
	student:'*person',
	teacher:'*person',
	school:'*school',
	date:'date',
	grade:'int'
    }
};
