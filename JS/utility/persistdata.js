
var PersistData = {

	clearMaps: function(){
		familyDraw.active_fam_group = null;
		GlobalLevelGrid.clear();
		familyMapOps.clear();
		uniqueGraphOps.clear();
	},

	makeTextFile: function(tex, textFile = null){
		var data = new Blob([tex],{type:'text/plain'});

		if (textFile !== null){
			window.URL.revokeObjectURL(textFile);
		}

		textFile = window.URL.createObjectURL(data);
		return textFile;
	},

	export: function(){
		if (MainPageHandler._currentMode === FORMAT.PEDFILE ){
			window.open(
				PersistData.makeTextFile(
					PersistData.toPedfileString(userOpts.exportPedGraphicLocs)
				)
			);
		}
	},

	pedigreeChanged: function(){
		var current_pedigree = PersistData.toPedfileString(true), /* local saves always store graphics */
			stored_pedigree = localStorage.getItem(localStor.ped_save);

//		console.log("current", current_pedigree);
//		console.log("stored", stored_pedigree);

		if (current_pedigree.trim().length < 1){
			return false;
		}

		if (stored_pedigree == null){
			return true;
		}

		if (current_pedigree !== stored_pedigree){
			return true;
		}
		return false;
	},

	toPedfileString: function(store_graphics){

		var text = "";

		familyMapOps.foreachperc(function(pid, fid, perc){

			var array = [
				fid, 
				perc.id, 
				perc.father.id || 0, 
				perc.mother.id || 0, 
				perc.gender, perc.affected
			]

			if (store_graphics){
				var gfx = uniqueGraphOps.getNode(pid, fid);

				if (gfx===-1){
					throw new Error(pid,fid,"does not have any graphics...");
				}

				var meta = gfx.graphics.getPosition();
				meta.name = perc.name

				array.push( "//", JSON.stringify(meta));
			}
			text += "\n"+ array.join('\t');
		});
		return text;
	}

}