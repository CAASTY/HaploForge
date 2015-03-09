var hgroup_colors = {}; // fam_id --> [founder_id], where array index = color/group

var zero_color_grp = -1,
	null_color_grp = -2;

function initFounderAlleles( fid, id )
{
	// Add founder to color group.
	if (!(fid in hgroup_colors))
		hgroup_colors[fid] = [];

	var perc_hdata = family_map[fid][id].haplo_data;

	for (var a = 0; a < perc_hdata.length; a++) 			// current allele
	{
		hgroup_colors[fid].push( id ); 						// Push the same guy twice for both alleles
															// Different colors (indices) will refer to the same (duplicated) id
		var color_group = hgroup_colors[fid].length;
		/*
		This is the color group. If it just pointed to it's data, then only a 0 1 or 2 would propogate down through
		the pedigree. Which would be MEANINGLESS, since we want to trace specific colors to individuals.

		Only founders get unique ones. Non-founders simply trace these from their parents.
		*/
		var	allele_ptrs = perc_hdata[a].pter_array; 		// [array of m pointers (for m markers)]

		for (var i=0; i < allele_ptrs.length; i++)
			allele_ptrs[i].color_group = color_group;
	}
// 	console.log("founder "+id, perc_hdata);
}








/*  Links non-founders to founders via parents. Potentially unphased, no error-checking at this stage

	Some assumptions:
	- Founder pointers are already set (for founders)
	- Always two alleles
	- Paternal allele is first, and maternal is second.
*/
function child2parent_link(pers, moth, fath)
{
	var pers_hp = pers.haplo_data,
		moth_hp = moth.haplo_data,
		fath_hp = fath.haplo_data,
		gender = pers.gender;


	assert(pers_hp[0].data_array.length === moth_hp[0].data_array.length
	    && pers_hp[0].data_array.length === fath_hp[0].data_array.length
		&& pers_hp[1].data_array.length === moth_hp[1].data_array.length
		&& pers_hp[1].data_array.length === fath_hp[1].data_array.length, "Allele lengths dont match");

	var tmp_i = 0;

	while (tmp_i++ < pers_hp[0].data_array.length - 1)
	{
		// Each persons allele is one of four possible parental alleles (autosomal)
		var a0_ht = fath_hp[0].data_array[tmp_i],
			a1_ht = fath_hp[1].data_array[tmp_i],  // Y allele, potential pitfall here -- input rows either follow a specific XY order, or need to do postproc.
			a2_ht = moth_hp[0].data_array[tmp_i],
			a3_ht = moth_hp[1].data_array[tmp_i];

		var a0_pr = fath_hp[0].pter_array[tmp_i].color_group,
			a1_pr = fath_hp[1].pter_array[tmp_i].color_group,
			a2_pr = moth_hp[0].pter_array[tmp_i].color_group,
			a3_pr = moth_hp[1].pter_array[tmp_i].color_group;


// 		if (a0_pr === undefined || a1_pr === undefined
// 			|| a2_pr === undefined || a3_pr === undefined)

		if (a0_ht === 0) a0_pr = zero_color_grp;
		if (a1_ht === 0) a1_pr = zero_color_grp;
		if (a2_ht === 0) a2_pr = zero_color_grp;
		if (a3_ht === 0) a3_pr = zero_color_grp;


		if (a0_ht === a1_ht  && a1_ht === a2_ht	&& a2_ht === a3_ht  && a3_ht === 0) continue;

		var m1_ht = pers_hp[0].data_array[tmp_i],  				// X allele
			m2_ht = pers_hp[1].data_array[tmp_i];  				// Y allele

		var m1_pr = pers_hp[0].pter_array[tmp_i].color_group,
			m2_pr = pers_hp[1].pter_array[tmp_i].color_group; 	// Y pointer


		/* -- Sex-linked and male scenario:
   		 Assuming XY and XX are alleles 0 1 2 3;
		  female: 0{2,3} = 02 03
		    male: 1{2,3} = 12 13
		 */
		if (SEXLINKED && gender === 1){ 						 // Sexlinked and male

			m2_pr.push( a1_pr );	 // No ambiguity there

			if (m1_ht === a2_ht) m1_pr.push( a2_pr );  // Maternal set both
			if (m1_ht === a3_ht) m1_pr.push( a3_pr );

			continue;
		}

		/* -- Autosomal or female scenario
		with the condition that the opposing allele must be chosen from the remaining sister pair:
		e.g: {0,1}{2,3} = 02 03 12 13
		 */
		if (m1_ht === a0_ht){ 						   // Add 0
			m1_pr.push( a0_pr )

			if (m2_ht === a2_ht) m2_pr.push( a2_pr );  // 02 scen;
			if (m2_ht === a3_ht) m2_pr.push( a3_pr );  // 03 scen;
		}

		if (m1_ht === a1_ht){ 						  // Add 1
			m1_pr.push( a1_pr )

			if (m2_ht === a2_ht) m2_pr.push( a2_pr ); // 12 scen;
			if (m2_ht === a3_ht) m2_pr.push( a3_pr ); // 13 scen;
		}
// 		console.log("setting undefined pointers...", moth.id, fath.id, tmp_i, m1_pr, m2_pr);
	}
}



// First pass -- assign groups
function assignHGroups()
{
	for (var fam in generation_grid_ids) {

		// First generation must be founders
		var founder_gen = generation_grid_ids[fam][0];

		for (var p = 0; p < founder_gen.length; p++)
			initFounderAlleles( fam, founder_gen[p] )


		for (var g = 1; g < generation_grid_ids[fam].length; g++){
			for (var p =0; p < generation_grid_ids[fam][g].length; p++)
			{
				var pers_id = generation_grid_ids[fam][g][p],
					pers    = family_map[fam][pers_id];

				var moth_id = pers.mother.id,
					fath_id = pers.father.id;

				// Person is a founder -- add and skip
				if (moth_id == undefined){
					initFounderAlleles( fam, pers_id );
					continue;
				}

				var moth = family_map[fam][moth_id],
					fath = family_map[fam][fath_id];

				child2parent_link(pers, moth, fath);
			}
		}
		console.log("hgroups fam =" + fam);
		removeAmbiguousPointers(fam);
	}
	console.log("colors=", hgroup_colors);
}



/* Runs after AssignHgroups !

 - Expands around ambiguous HTs to find the nearest encapsulating haploblock.

 - If an ambiguous region is continuous, it searches for the *least* ambiguous incices
   within the region and assigns a common color group (where possible) to these indices
   which act as the new borders to expand from.

 - Recursion may be required, though not wanted :(

*/
function removeAmbiguousPointers(fam)
{
	var MIN_HAP_STRETCH = 2;


	for (var g = 0; g < generation_grid_ids[fam].length; g++){
		for (var p =0; p < generation_grid_ids[fam][g].length; p++)
		{
			var id = generation_grid_ids[fam][g][p];
			var both_alleles = family_map[fam][id].haplo_data;

			for (var a = 0; a < both_alleles.length; a++)
			{
				var ambig_indices_singles = [],
					ambig_indices_regions = [],
					pointer_array = both_alleles[a].pter_array;

				var curr_index = 0;

				// 1. Find ambiguous indices
				var last_ambig = -100,
					temp_group = new Int8Array(2),
					temp_started_group = false;


				while (curr_index++ < pointer_array.length - 1){
					if (pointer_array[curr_index].color_group.length > 1){

						if (curr_index === last_ambig + 1){ 			// identified the start of a continuous region
							if (!(temp_started_group))
							{
								temp_started_group = true;  // new region, starting from previous
								temp_group[0] = last_ambig; // store previous

							}
						}
						else{ 											// identified discontinuity
							if (temp_started_group){
								temp_group[1] = curr_index-1; 			// store previous
								temp_started_group = false;

								ambig_indices_regions.push( temp_group );
								temp_group = new Int8Array(2); 			// reset
							}
							ambig_indices_singles.push( curr_index );
						}
						last_ambig = curr_index;
					}
// 					else{ // Non-ambiguous, remove array and assign to first_elem
// 						if (pointer_array[curr_index].color_group === undefined){
// 							console.log("undefined =", id, "@", both_alleles[a].data_array[curr_index]);
// 						}
// 						pointer_array[curr_index].color_group = pointer_array[curr_index].color_group[0];

// 					}
				}


				// 2. Find surrounding blocks for each ambiguous index,
 				//    if blocks aren't the same, measure their lengths and go for longest (or pick random?)

				// Process singles
				curr_index = 0;

				while (curr_index++ < ambig_indices_singles.length -1){
					var ambig_index = ambig_indices_singles[curr_index];

					var back_index = ambig_index,
						forw_index = ambig_index;

					while (pointer_array[forw_index++].color_group.length > 1
						  && forw_index < pointer_array.length){} 	//Search ahead for next unambiguous pointer

					while (pointer_array[back_index--].color_grouplength > 1
						  && back_index >= 0){} 					//Search back also;

					//Compare colors
					var color_back = pointer_array[back_index].color_group[0],
						color_forw = pointer_array[forw_index].color_group[0];

					//Outcomes:

					// a. colors match - yay
					if (color_back === color_forw){
						pointer_array[ambig_index].color_group = color_back;
						break;
					}

					// b. colors do not match, get block lengths pick largest
					// Just pick random for now
					pointer_array[ambig_index].color_group = color_forw;

// 					var len_back = 0, len_forw = 0;
// 					while (  pointer_array[back_index--].color_group.length === 1
// 						  && back_index >= 0) len_back ++;

// 					while (  pointer_array[forw_index++].color_group.length === 1
// 						  && forw_index < pointer_array.length) len_forw ++;


// 					pointer_array[ambig_index].color_group = (len_forw > len_back)?color_forw:color_back;

				}

				// Process regions
				curr_index = 0;

				while (curr_index++ < ambig_indices_regions.length - 1)
				{
					var lower_index = ambig_indices_regions[curr_index][0],
						upper_index = ambig_indices_regions[curr_index][1];

					console.log( lower_index, upper_index);

					// Find the least ambiguous region
					var possible_sequences = [];


					// Step through region, checking that each newly detected color group must cover
					// at least the min stretch, or else be discarded

					//The start colors determines the number of times we loop over the region
					var iter = lower_index + 1;

					var start_colors = pointer_array[iter].color_group
					while ( true ){

						for (var s=0; s < start_colors.length; s++){
							var current_group_counter = 0,
								last_group = -1;

							var group = start_colors[s],
							var possib_sequences_for_start = [];
							var stepForward = 0; //amount to move after a (un)successful lookahead

							// This loop looks ahead
							var look_index = iter,
								consec_group = [],  			// This gets cleared a lot
								current_potential = []

							while ( true ){
								var continuing_group = false;

								// Search next for ongoing group
								var next_colors = pointer_array[look_index].color_group;

								for (var n=0; n < next_colors.length; n++){
									var new_group = next_colors[n];

									if (new_group === group){
										continuing_group = true;
										current_group_counter += 1
										break;
									}
								}

								// Did we find the same group?
								if (continuing_group){
									//Yes, increment and move on
									look_index +=1;
									consec_group.push(group);
									continue;

								}
								// Did not find group, change:
								// Pick

								// Did the last group pass the heuristic?

								if (current_group_counter >= MIN_HAP_STRETCH){
									//Yes, add it to the current array
									current_potential = current_potential.concat(consec_group);
									stepForward += current_group_counter;
									break;
								}



						}



					}



					while (true){
						last_color_stretch.shift();

						var colors = pointer_array[iter].color_group;

						//Check to see if curr_color exists in region
						for (var c =0; c < colors.length ; c++)
						{
							var col = colors[c];

							if (col === last_col)
								current_color_stretch
								if (current_color_stretch >= MIN_HAP_STRETCH)

						}


						last_color_stretch.push(curr_color);
					}


					for (var r=lower_index; r <= upper_index; r++){

						//founder alleles are unambiguous
						if (typeof pointer_array[r].color_group === "number") continue;

						if (pointer_array[r].color_group === undefined)
							console.log("undefined, id="+id+", marker="+r+", all="+both_alleles[a].data_array[r]+", pter=", pointer_array[r]);

						for (var c=0; c < pointer_array[r].color_group.length; c++)
						{
							var color = pointer_array[r].color_group[c];

							if (!(color in map)) map[color] = [];
							map[color].push( r );
						}
					}
					console.log(map);
					continue;
					// Sort map by num keys:
					//    Pick sets such that:
					//    * There is no index remaining in a group by itself
					//    * Minimal number of sets (so picking largest is not necceasirily best)
					for (var color_key in map){
						var value_indices = map[color_key];
						    value_indices.sort();

						// Check if they're consecutive
						var last_index = value_indices[0]-1, // peel first off
							isConsecutive = true;

						for (var c in value_indices){
							if (c !== last_index + 1) {
								isConsecutive = false;
								break;
							}
							last_index = c;
						}
					}
				}
			}
		}
	}
}













