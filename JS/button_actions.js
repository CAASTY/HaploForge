

function toggleRAng(){
	use_right_angles = !use_right_angles;
	touchlines();
	main_layer.draw();
}

function playalong(){
	assignHGroups();
	addHaplos();
}
