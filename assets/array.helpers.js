
let peeps = [
	{
		name:      	'Micheal A Isaacs',
		gender:    	'male',
		race:      	'White',
		birthday:  	'12/21/1969',
		age: 		50,
		street:    	'4504 Rocket Drive',
		city:      	'Minneapolis',
		state:     	'Minnesota',
		stateShort: 'MN',
		zip:   		55415,
		telephone: 	'612-998-9976',
		mobile:    	'952-200-1181',
	},
	{
		name:      	'Amy D Ward',
		gender:    	'female',
		race:      	'White',
		birthday:  	'12/14/1991',
		age: 		28,
		street:    	'2159 Stanley Avenue',
		city:      	'Huntington',
		state:     	'New York',
		stateShort: 'NY',
		zip: 		11743,
		telephone: 	'516-567-7863',
		mobile:    	'631-697-5971',
	},
	{
		name:      	'Melvin M Obanion',
		gender:    	'male',
		race:      	'Asian',
		birthday:  	'7/4/1950',
		age: 		70,
		street:    	'3534 Yorkshire Circle',
		city:      	'Greenville',
		state:     	'North Carolina',
		stateShort: 'NC',
		zip: 		27834,
		telephone: 	'252-323-0747',
		mobile:    	'252-412-7087',
	},
	{
		name:      	'Abraham I Mobley',
		gender:    	'male',
		race:      	'White',
		birthday:  	'8/19/1994',
		age: 		25,
		street:    	'2814 Hart Ridge Road',
		city:      	'Saginaw',
		state:     	'Michigan',
		stateShort: 'MI',
		zip:   		48607,
		telephone: 	'989-266-9868',
		mobile:    	'989-392-6581',
	},
	{
		name:      	'Junior J Hardin',
		gender:    	'male',
		race:      	'White',
		birthday:  	'11/30/1971',
		age: 		48,
		street:    	'892 Doe Meadow Drive',
		city:      	'Beltsville',
		state:     	'Maryland',
		stateShort: 'MD',
		zip:   		20705,
		telephone: 	'512-586-1907',
		mobile:    	'240-203-9302',
	},
	{
		name:      	'Scott S Taylor',
		gender:    	'male',
		race:      	'Black',
		birthday:  	'2/6/1967',
		age: 		53,
		street:    	'1539 Long Street',
		city:      	'Gainesville',
		state:     	'Florida',
		stateShort: 'FL',
		zip:   		32641,
		telephone: 	'352-280-4401',
		mobile:    	'352-301-8858',
	},
	{
		name:      	'Nancy S Wilber',
		gender:    	'female',
		race:      	'White',
		birthday:  	'11/25/1972',
		age: 		47,
		street:    	'4046 Hillside Street',
		city:      	'Phoenix',
		state:     	'Arizona',
		stateShort: 'AZ',
		zip:   		85034,
		telephone: 	'480-603-8269',
		mobile:    	'480-262-9614',
	},
	{
		name:      	'Charles V Miller',
		gender:    	'male',
		race:      	'White',
		birthday:  	'1/14/1973',
		age: 		47,
		street:    	'562 Saint Francis Way',
		city:      	'New Berlin',
		state:      'Wisconsin',
		stateShort: 'WI',
		zip:  		53151,
		telephone: 	'262-903-4703',
		mobile:    	'715-245-5502',
	}
]


/**
 * Filters a collection of objects based on whether any object properties match a given string criteria
 * @param  {array} list    collection of objects to be filtered
 * @param  {string} filter The filter to be applied to each object
 * @param  {array}  fields Optional array of object property names to check against
 * @return {array}         the filtered collection of length 0 to N matching results
 */
function filterCollection(list, filter, fields=[]) {

	let res = []

	// fields must be an array, default to empty array
	if (fields && !Array.isArray(fields)) {
		console.error(`ERROR: fields must be an array. ${typeof(fields)} given.`)
		fields = []
	}


	list.forEach((el, index) => {

		// error on first entry not being an object
		if (!isObject(el)) {
			let msg = `ERROR: collection entry ${index} contains non-object entries`
			throw new Error(msg)
			console.error(msg)
			return
		}

		// get keys of fields list if provided, else use the object properties
		let keys = fields.length > 0 ? fields : Object.keys(el)

		let append = keys.some((key, kindex) => {
			let keyType = typeof(el[key])

			let value = (el[key]).toString().trim().toLowerCase()

			if (el.hasOwnProperty(key)
			&& 	keyType !== 'object'
			&&  keyType !== 'array'
			) {
				if (value.indexOf(filter) >= 0) {
					return true
				}
			}

			return false
		})

		// append the result if successful
		if (append) {
			res.push(el)
		}

	})

	return res
}



function isObject(value) {
	return typeof(value) === 'object'
}



peeps.forEach(el => {

	let res

	res = typeof(el.name) === 'string'
	res = typeof(el.gender) === 'string'
	res = typeof(el.race) === 'string'
	res = typeof(el.birthday) === 'string'
	res = typeof(el.age) === 'number'
	res = typeof(el.street) === 'string'
	res = typeof(el.city) === 'string'
	res = typeof(el.state) === 'string'
	res = typeof(el.stateShort) === 'string'
	res = typeof(el.zip) === 'number'
	res = typeof(el.telephone) === 'string'
	res = typeof(el.mobile) === 'string'

	if (!res) {
		throw new Error(`broken value on ${el.name}`)
	}
})




let res = filterCollection(peeps, '512', ['name', 'street', 'telephone'])

console.log(res)


