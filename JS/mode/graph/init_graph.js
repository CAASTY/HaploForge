/*Drawing a pedigree - trickier than you'd think, simple draw rec messes up lines

Steps:
   1. Make a grid
   2. Recurse nodes
      - toplevel nodes are downshifted by existence of parents
      - place under a male-then-female order.
        - for extra mates, that is [male,female,female,...] or [male,male,...,female]
   3. Render nodes top-down from grid under parental placement
   4. Populate unique edges and render after
  - Allowed edges: [0]parent-mate, [1] parent-to-parentline, [2] child-to-parentline
  - Struct: { 0: horiz line
              1: parent_line:
                      connector from center of PAR_i and PAR_j extending down vert line
                      initiated from parent on parent.children.length > 0,
              2: child_conn :
                      connector from child to parent_line}

Notes:
   * Main intersect problems are x-specific, no need to worry about generations
   * Minimal drawing graph is then peds + unique_edges, and we can use that graph
     for all future draws (moving, dragging, etc)

*/






// After populating, add graphics
function graphInitPos(start_x, start_y){

	var x_shift_fam = 0;

	GlobalLevelGrid.foreachfam(function(grid, fam){
		// Each fam gets their own group
		var fam_group = addFamily(fam, x_shift_fam, 10);
		var max_x = 0;

		var fam_gfx = uniqueGraphOps.getFam(fam);
		fam_gfx.group = fam_group

		// Descending down the generations.
		// Main founders are at top
		var y_pos = start_y,
			nodes = fam_gfx.nodes,
			edges = fam_gfx.edges;


		// Init Nodes, ordered by generation
		GlobalLevelGrid.foreachgeneration(fam, function(indivs_in_gen){

			var x_pos = start_x;

			var num_peeps = indivs_in_gen.length,
				isOddNum = !((num_peeps%2)==0),
				center_x = Math.floor(max_fam_width/2);


			/*
			Everyone is spaced one horiz_space apart, but centred:
			-	odd number of people in a row: centre middle perp
			-	even number of people in a row: space middle two half horiz_space from center
			and then expand out
			*/

			//Can't be helped, JS doesn't support macros...
			function placePerp(index, posx){
				var perp_id = indivs_in_gen[index],
					perp = familyMapOps.getPerc(perp_id, fam),
					n_perp = nodes[perp_id];

				// Restore meta
				if (typeof perp.stored_meta !== "undefined"){
					//console.log("using stored meta", perp_id, perp.stored_meta);
					var meta = JSON.parse(perp.stored_meta);

					posx = meta.x;
					y_pos = meta.y;
					perp.name = meta.name;

					delete perp.stored_meta;
				}


				// Center on parent's positions
				var moth = perp.mother,
					fath = perp.father;

				// Parent's exist and offsrping is only child
				if (moth !== 0 && moth.children.length === 1){
					var moth_gfx = nodes[moth.id].graphics.getX(),
						fath_gfx = nodes[fath.id].graphics.getX();

					posx = (moth_gfx + fath_gfx) / 2 ;
				}


				n_perp.graphics = addPerson(perp, fam_group, posx, y_pos);

// 				posx  = Math.floor(posx/grid_rezX)*grid_rezX;
// 				y_pos = Math.floor(y_pos/grid_rezY)*grid_rezY;

				if(posx > max_x) max_x = posx;
			}

			var start1, start2;

			if (isOddNum)
			{
				var center_ind = Math.floor(num_peeps/2);
				placePerp(center_ind, center_x);

				//Expansion
				var tmp1 = center_ind,
					tmp2 = center_ind;

				start1 = center_x,
				start2 = center_x;

				while(tmp1 > 0){
					placePerp(--tmp1, start1 -= horiz_space);
					placePerp(++tmp2, start2 += horiz_space);
				}
			}
			else {
				var center2_ind = (num_peeps/2),
					center1_ind = center2_ind - 1;

				//Expansion
				var tmp1 = center2_ind,
					tmp2 = center1_ind;

				start1 = center_x + Math.floor(horiz_space/2);
				start2 = center_x - Math.floor(horiz_space/2);

				while (tmp1 > 0){
					placePerp(--tmp1, start1 -= horiz_space);
					placePerp(++tmp2, start2 += horiz_space);
				}
			}

			y_pos += vert_space + 25;

		});


		// Init Edges -- in order of Mateline, and Childline
		for (var tp = 0; tp <= 2; tp ++){

			for(var key in edges)
			{
				var edge = edges[key],
					type = edge.type,
					end_join_id = edge.end_join_id,
					start_join_id = edge.start_join_id;

				if (type !== tp) continue;

				var	start_pos, end_pos,
					consang = false;


				if(type === 0){
					// Mateline
					start_pos = nodes[start_join_id].graphics.getPosition();
					end_pos = nodes[end_join_id].graphics.getPosition();
					consang = checkConsanginuity(fam, start_join_id, end_join_id);
				}
				else if(type === 2)
				{
					// Childline
					var mateline_points = edges[start_join_id].graphics.getPoints(),
						child_pos       = nodes[  end_join_id].graphics.getPosition();

					start_pos = {
						x: Math.floor((mateline_points[0] + mateline_points[2])/2),
						y: mateline_points[1]
					};
					end_pos = {	x: child_pos.x,	y: child_pos.y	};
				}

				else assert(false,"Wrong type! "+key+", type= "+type);


				edge.graphics = addRLine(fam_group, start_pos, end_pos, consang); 					//DRAW
				edge.consangineous = consang;

				edge.graphics.moveToBottom();
			}
		}
		x_shift_fam += max_x + 20;
	
	});


	//Go over everyone and touch their lines
	finishDraw();
	touchlines();
	spaceFamGroups();

	main_layer.draw();
}


// Find highest founder - A* best-first search
function checkConsanginuity(fam_id, pers1_id, pers2_id)
{
    var fam_map = familyMapOps.getFam(fam_id),
        pers1 = fam_map[pers1_id],
        pers2 = fam_map[pers2_id];

    // Find pers1 founder
    var routes2 = [];
    routes2.push( pers1 );
    routes2.push( pers2 );

    //console.log("routes2=", pers1_id, pers2_id);

     // = [pers1, pers2];

    var complete = [],
    	loopnum = 0;

    // console.log(pers1.id+"  and  "+pers2.id);
    while(routes2.length > 0 && loopnum++ < 100){

        	var perc = routes2.shift(); // remove from search

/*        	if (perc === undefined){
        		
        	}
*/
        	//Try mother + father
	        if (perc.mother === 0 && perc.father === 0){
	        	complete.push(perc.id);
	        	continue;
	        }

        	if (perc.mother != 0) routes2.push(perc.mother);
        	if (perc.father != 0) routes2.push(perc.father);

        	// console.log(" routes=", routes2.map( function(n){ return n.id;}));
    }
    // console.log("complete=", complete);

    //Find duplicates in complete
    complete = complete.sort();
    for (var a=0; a < complete.length -1; a++){
    	if (complete[a+1] === complete[a])
    		return true;
    }

    return false;
}

