

var MainPageHandler = {

	_currentMode : null,

	__mainpage_divgroups : {
		"main"  	: document.getElementById('maincircle'),
		"toolset"	: document.getElementById('selection_tools'),
		"saveclose" : document.getElementById('save_and_close'),
		"container"	: document.getElementById('container'),
		"pedexist"  : document.getElementById('pedresume_label'),
		"hapexist"  : document.getElementById('haploresume_label')
	},

	div_groups: function(key){
		return MainPageHandler.__mainpage_divgroups[key];
	},

	showDiv: function(key, bool){
		MainPageHandler.div_groups(key).style.display = bool?"":"none";
	},

	setPrevExistingButtons: function(){
		MainPageHandler.showDiv("pedexist",
			(localStorage.getItem(localStor.ped_save) !== null)
		);
		
		MainPageHandler.showDiv("hapexist", 
			(localStorage.getItem(localStor.hap_save) !== null)
		);
	},

	defaultload: function(){
		MainPageHandler._currentMode = "Main"

		/** Show main page, hide rest **/
		MainPageHandler.showDiv("main", true);
		MainPageHandler.showDiv("container", false);
		MainPageHandler.showDiv("saveclose", false);
		MainPageHandler.showDiv("toolset", false);

		MainPageHandler.setPrevExistingButtons();
	},

	haplomodeload: function(){
		MainPageHandler._currentMode = "Haplo"

		/** Show haplotypes, after file (up)load **/
		MainPageHandler.showDiv("main", false);

		MainPageHandler.showDiv("container", true);
		MainPageHandler.showDiv("saveclose", true);

		ToolSetModes.setToSelectionPreMode();
		MainPageHandler.showDiv("toolset", true);		
	},

	createpedmode: function(){
		MainPageHandler._currentMode = "Pedigree"

		/** Show haplotypes, after file (up)load **/
		MainPageHandler.showDiv("main", false);

		MainPageHandler.showDiv("container", true);
		MainPageHandler.showDiv("saveclose", true);

		ToolSetModes.setToPedCreate();
		MainPageHandler.showDiv("toolset", true);
	}
}