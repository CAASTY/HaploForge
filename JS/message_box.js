
var utility = {
	_bg: document.getElementById('modal_bg'),

	prompt: function(query){
		// Own method drop in?
		return prompt(query);
	},

	message: function(){
		/* Change to a notification system for users*/
		console.log(arguments)
	},

	getMouseXY: function(){
		return stage.getPointerPosition();
	},

	showBG: function(){
		this._bg.style.display = "block";
	},

	hideBG: function(){
		this._bg.style.display = "none";
	}

}

var famProps = {
	_box : document.getElementById('family_props'),
	_id : document.getElementById('family_id'),
	_name : document.getElementById('family_name'),
	_submit: document.getElementById('family_submit'),

	hide: function(){ this._box.style.display = "none";},
	show: function(){ this._box.style.display = "";},

	showProps: function(family){
		utility.showBG();
		this.show();

		this._id.value   = family.id;
		this._name.value = family.name;
	},

	getProps: function(){
		var fam = {id:-1, name:""};

		fam.id = Number( this._id.value );
		fam.name = this._name.value;

		utility.hideBG();
		this.hide();
		return fam;
	},

	display: function(family, callback){
		this.showProps(family);
		this._submit.onclick = function(){
			var fam = famProps.getProps();
			callback(fam);
		}
	}

}


var persProps = {
	_box : document.getElementById('person_props'),	
	_id : document.getElementById('pers_id'),
	_name : document.getElementById('pers_name'),
	_gender : document.getElementById('pers_gender'),
	_affect : document.getElementById('pers_affect'),
	_submit : document.getElementById('pers_submit'),

	hide: function(){ this._box.style.display = "none";},
	show: function(){ this._box.style.display = "";},

	showProps: function(person){
		utility.showBG();
		this.show();

		this._id.value     = person.id;
		this._name.value   = person.name;
		this._gender.value = person.gender;
		this._affect.value = person.affected;
	},

	getProps: function(){
		var person = {id:-1,gender:-1,affected:-1, name:""};

		person.id = Number(this._id.value);
		person.gender = Number(this._gender.value);
		person.affected = Number(this._affect.value);
		person.name = this._name.value;

		this.hide();
		utility.hideBG();

		return person;
	},

	display: function(person, callback){
		this.showProps(person);
		this._submit.onclick = function(){
			var pers = persProps.getProps();
			callback(pers);
		}
	}
}


var messProps = {
	_box : document.getElementById('message_props'),
	_header : document.getElementById('message_head'),
	_text   : document.getElementById('message_text'),
	_submit: document.getElementById('message_submit'),

	hide: function(){ this._box.style.display = "none";},
	show: function(){ this._box.style.display = "";},

	display: function(header,text, callback){
		utility.showBG();
		this.show();

		this._header.innerHTML = header;
		this._text.innerHTML   = text;

		this._submit.onclick = function(){
			messProps.hide();
			utility.hideBG();
			callback();
		};
	}
}


famProps.hide();
persProps.hide();
messProps.hide();



document.getElementById('homology_buttons').style.display = 'none'
document.getElementById('pedcreate_views').style.display = 'none'
document.getElementById('buttons').style.display = 'none'