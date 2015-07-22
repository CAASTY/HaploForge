#!/bin/bash
root_dir=`readlink -f ../`
tmp="tmp"
mkdir $tmp


index_file=$root_dir/index.html
css_file=$root_dir/main.css

# Put all js in a single file
all_js="$tmp/all_scripts.js"
echo "" > $all_js

js_files=$(grep "script" $index_file | awk -F '"' '{print $2}' | grep -v framework) 
kinetic_insert=$(grep "framework" $index_file | sed 's|JS/.*/k|k|' )

for js_file in $js_files; do
	echo $js_file
	cat $root_dir/$js_file  >> $all_js
done;
# Add terminal character sequence (javascript splits off this later)
echo "//////" >> $all_js


# Encrypt code here
echo -n "Picturifying..."
./to_image.py $all_js
echo "X"	# creates my_code.png

# Place all non-js into a new index file
new_index="index.html"
echo "$(grep -v script $index_file | grep -v link )" > $new_index

# Replace with css and javascript
style_data="<style>
`cat $css_file`
</style>"

# Obfuscate decoder JS (done online now)
#js_decoder="loader.js"
js_decoder_obfs="loader_obfs.js"
#slimit -mt $js_decoder > $js_decoder_obfs

tmp_index="tmp_index.html"
echo "" > $tmp_index

while read line; do
	if [[ "$line" =~ "[LOCAL]" ]]; then
		echo "$line" | sed 's|\[LOCAL\]||' >> $tmp_index
		continue;
	fi

	echo "$line" >> $tmp_index

	if [[ "$line" =~ "<h1>" ]]; then
		echo "$style_data" >> $tmp_index

	elif [[ "$line" =~ "<!-- CODE GOES HERE" ]]; then
		echo "$kinetic_insert" >> $tmp_index
		echo "
<!-- Site traffic  -->
<div id='google_analytics'>
	<img id='cc' src='logo.png' ></img>
	<canvas id='cd'></canvas>
</div>

<script id='google_metrics' >
`cat $js_decoder_obfs`
</script>
" >>  $tmp_index

	fi
done<$new_index

# Update
mv $tmp_index $new_index

rm -rf $tmp
