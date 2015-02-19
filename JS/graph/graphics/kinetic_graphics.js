// ------------ Kinetic globals ------------
var stage = new Kinetic.Stage({
	container:'container',
	width: window.innerWidth,
	height: window.innerHeight
});

/* All nodes (even across seperate families) share the same node layer,
   but are bound by family_group stored in unique_graph_objs[fam_id].group; */

var main_layer = new Kinetic.Layer();


// ------------ Kinetic Tools --------------
function addSquare([c_x,c_y], color)
{
	return new Kinetic.Rect({
		x: - nodeSize,
		y: - nodeSize,
		width: nodeSize *2,
		height: nodeSize * 2,
		fill: color,
		strokeWidth: 2,
		stroke: default_stroke_color
	});
}


function addCircle([c_x,c_y], color)
{
	return new Kinetic.Circle({
		x: c_x, y: c_y, radius: nodeSize,
		fill: color, strokeWidth: 2,
		stroke: default_stroke_color
	})
}


function addDiamond([c_x,c_y], color){
	alert("fix lucy");
}




function changeRLine(line, start, end){
	var mid_y = Math.floor((start.y + end.y)/2),
		m1    = {		x: start.x,		y: mid_y	},
		m2    = {		x: end.x,       y: mid_y	};

	line.setPoints([start.x, start.y, m1.x, m1.y, m2.x, m2.y, end.x, end.y]);
// 	line.setPoints([start.x, start.y, end.x, end.y]); // -- simple
}


function addRLine(fam_group, start, end, consang=false){
	var line = new Kinetic.Line({
		stroke: consang?'red':'black',
		strokeWidth: consang?4:2
	});
	changeRLine(line, start, end);

	fam_group.add(line);
	return line;
}


// ------- Family Functions --------------
function addFamily(fam_id, sx, sy){
	var g = new Kinetic.Group({
		x: sx, y:sy,
		draggable: true,
		id: fam_id
	});
	var t = new Kinetic.Text({
		x: 50,
		text: fam_id,
		fontFamily: "Arial",
		fontSize: 18,
		fill: 'black'
	})
	g.add(t);

	main_layer.add(g);
	return g;
}


function addPerson(person, fam_group,  t_x, t_y)  //positions relative to family group
{
	var gender = person.gender,
		    id = person.id,
		   aff = person.affected;

	function pedigreeShape(){
		var shape = 0;

		function addMale  () {  shape = addSquare ([0,0], col_affs[aff])   }
		function addFemale() {  shape = addCircle ([0,0], col_affs[aff])   }
		function addAmbig () {  shape = addDiamond([0,0], col_affs[aff])   }

		switch(gender){
			case 0: addAmbig() ; break;
			case 1: addMale()  ; break;
			case 2: addFemale(); break;
			default:
				assert(false, "No gender for index "+gender);
		}
		return shape;
	}


	//Add Shape and text Text
	var shape = pedigreeShape();

	var tex = new Kinetic.Text({
		x: - (""+id+"").length*3,	y: nodeSize + 8,
		text: id,
		fontSize: 'Calibri', //change to global setting
		fill: default_stroke_color
	});

	//Each person is their own group of inter-related ojects
	var group = new Kinetic.Group({
		x: t_x, y: t_y,
		draggable: true
	});
	group.add(shape);
	group.add(tex);


	//On drag do
	group.on('dragmove', function(e){
		//Snap-to-grid
		var x = e.target.attrs.x;
		var	y = e.target.attrs.y;
		group.setX( (Math.floor(x/grid_rezX)*grid_rezX) );
 		group.setY( (Math.floor(y/grid_rezY)*grid_rezY) + 30 );

		redrawNodes(id, fam_group.attrs.id, true);
	});

	//Assume addFamily has already been called
	fam_group.add(group);
	return group;
}



function finishDraw(){
//	stage.add(line_layer);
//	stage.add(node_layer);
	stage.add(main_layer);
}
