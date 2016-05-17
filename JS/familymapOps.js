var familyMapOps = {

	insert: function(person, family_id){
		
		if (!(family_id in family_map)){
			family_map[family_id] = {}
			console.log("FMO: adding new family", family_id)
		}

		if (!(person.id in family_map[family_id])){
			family_map[family_id][person.id] = person;
			return 0;
		}
		console.log("FMO:", person_id,"already in", family_id)
		return -1;
	},

	remove: function(person_id, family_id)
	{
		if (family_id in family_map){
			if (person_id in family_map[family_id]){
				delete family_map[family_id][person_id];
				return 0;
			}
			console.log("FMO:", person_id,"not in", family_id)
			return -1;
		}
		console.log("FMO:", family_id, "not in map");
		return -1;
	}
}
