
/* How about this:
For each row, I test lookaheads of all indexes on that row.
 - The index with the greatest stretch is explored first
 - The next index is the




*/


function resolveAmbiguousRegions__DEBUG(array, start=0, end=array.length-1)
{
	var min_stretch_len = 1;

	var arrayOfIndexes = (function (){
		var arr = [];
		for (var k=start; k <= end; k++){
			arr.push({
				index: array[k].color_group.length-1,
				last_split: 0
			})
		}
		arr.push({index:0, last_split:0}); 							//dummy index, needed for jumping back

		return arr;
	})();


	var numset = 0,
		bestset = 99999;

	var	best_path = null,
		temppath = [],
		path_list = [];

	var row = 0,
		num_cycles = 0,
		actual_row = start;

	var current_stretch = min_stretch_len;

	console.time("yer");

	while (true)
	{
		if (num_cycles ++ > 50) break;

		actual_row = row + start;

		var color_index = arrayOfIndexes[row];
		console.log("path="+temppath+", color_index="+color_index.index);

		if (row === 0){
			if (color_index.index < 0) break; 					//No more paths to explore after jumping back.
			numset = 0;
		}

		var jumpBack = false;

		if (row === arrayOfIndexes.length-1)
		{
			if (numset < bestset){
				bestset = numset;
				best_path = temppath;
			}
			path_list.push( temppath );

			jumpBack = true;
		}

		if (color_index.index < 0) jumpBack = true;



		//Jump back to last split
		if (jumpBack){
			console.log( ">>jumprow:"+actual_row+"-->"+color_index.last_split+", index to:"+(arrayOfIndexes[color_index.last_split].index - 1)+'\n');

			row = color_index.last_split;
			temppath = cloneTill(temppath, row);

// 			arrayOfIndexes[row].index;
			numset --;

			continue;
		}
		//We have an unexplored color
		var color = array[actual_row].color_group[color_index.index];
		console.log("    trying color='"+color+"'");

// 		if (color === undefined)
// 			break;


		if (color === -1){
			console.log("    zero group, skipping");
			temppath.push(zero_color_grp);
			row ++;
			actual_row ++;
			continue;
		}

		//Perform lookahead
		var stretch = actual_row;
		while ( stretch <= end )
		{
			var new_colors = array[stretch].color_group;

			if (new_colors[0] === zero_color_grp){
				temppath.push(zero_color_grp)
				stretch ++;
				current_stretch ++;
			}
			else if (new_colors.indexOf(color)!== -1){
				temppath.push(color);
				stretch ++;
				current_stretch ++;
			}
			else break;

		}
 		stretch -= actual_row;

		// Unsuccessful
		if (current_stretch < min_stretch_len){
			console.log("    failed (too short)", current_stretch+"<"+min_stretch_len);
			while(stretch --> 0) temppath.pop(); 	// clear changes

			arrayOfIndexes[row].index--; 			// next attempt at this row will try a different index
			continue;
		}
		// Successfully found a new color. Splitting
		console.log("    worked, arrayOfIndexes["+(actual_row+stretch)+"].last_split = "+actual_row);
		arrayOfIndexes[row+stretch].last_split = row; // this row is where we split
 		arrayOfIndexes[row].index--; 		  // somehow this is needed...

		row += stretch;
		numset ++;

		current_stretch = 0;
	}
	console.timeEnd("yer");

	console.log("sols", path_list);
	console.log("best path=", best_path);
	console.log("num cycles=", num_cycles);
	return best_path;
}
