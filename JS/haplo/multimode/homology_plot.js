var plots;

function debugUpdatePlots(spec_plot, stretch, score)
{
	plotScoresOnMarkerScale( spec_plot, stretch, score )
}


function plotScoresOnMarkerScale (specific_plot, stretch, score){
	/* Grab rangeline and hang graphics from it.

	 Shape likely to be > 1000 px tall, and rangeline only 300 px,
	 which is a scale down of 3x that most pc's can handle
	  -- hopefully Kinetic/canvas handles mipmaps efficiently
	     so I don't have to ~~~
	*/

	var marker_scale = showSlider(true),
		rangeline = marker_scale.rangeline,
		r_height = slider_height;

	var plen = specific_plot.length,
		points_per_pixel = plen / r_height,
		ppp = Math.ceil(points_per_pixel);


	if (marker_scale.line1 !== undefined){
		marker_scale.line1.destroy();
		marker_scale.line2.destroy();
	}

	// stretch min -- must have >0 for stretch min else 0
	// score_min -- must have score > score_min else 0
	function plotAxis3( given_plot, stretch_min, score_min )
	{
		var p=0,
			q=0,
			block_size = 10,
			average_points = [0,-1],
			inform_points = [0,-1];

		var current_stretch_len = 0,
			in_hom_region_stretch = false;
		
		while (p < plen)
		{
			var average_x = 0,
				inform_x = 0; // <-- inform. within block, cannot overlap

			for (var b=0; b++ < block_size;)
			{
				var val = given_plot[p++];

				// Handle stretches
				if (val >= score_min){
					if (!(in_hom_region_stretch)){
						in_hom_region_stretch = true;
					}
					current_stretch_len ++
				}
				else{
					if (in_hom_region_stretch){
						in_hom_region_stretch = false;

						if (current_stretch_len >= stretch_min){
							inform_x += 1;
						}
					}
				}

				average_x += val;
			}
			average_x /= block_size;

			average_points.push(average_x, q)
			inform_points.push( inform_x, q);

			q++;
		}
		average_points.push(0,q+1);
		inform_points.push(0,q+1);

		var avline = new Kinetic.Line({
			x: rangeline.getX(),
			y: rangeline.getY(),
			points: average_points,
			stroke: 'green',
			strokeWidth: 0.3,
			closed: true,
			fill: 'green',
			alpha: 0.3
		});

		avline.scaleY( block_size * r_height/plen );
		avline.scaleX(0.5)

		var infline = new Kinetic.Line({
			x: rangeline.getX(),
			y: rangeline.getY(),
			points: inform_points,
			stroke: 'blue',
			strokeWidth: 0.3,
			closed: true,
			fill: 'blue',
			alpha: 0.3
		});

		infline.scaleY( block_size * r_height/plen );
		infline.scaleX( 15 );

		return [avline,infline];
	}

	var lines = plotAxis3( specific_plot, stretch, score )

	marker_scale.line1 = lines[0];
	marker_scale.line2 = lines[1];

	marker_scale.add( marker_scale.line1 );
	marker_scale.add( marker_scale.line2 );

	marker_scale.line2.setZIndex(-99);
	marker_scale.line1.setZIndex(-99);

	mscale_layer.draw();
}