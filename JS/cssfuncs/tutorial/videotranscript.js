class VideoTranscript {

	constructor(pageTutorial, source, transcript)
	{
		this.__symbolplay  = "&#9654";
		this.__symbolpause = "&#9646;&#9646";


		// Access to Top and Bottom modifiers
		this.pageTutor = pageTutorial;

		this.__lastIndex = 0; // transcript iterator
		this.__nextTime = -1;

		this.transcript = transcript
		this.time_array = VideoTranscript.__makeTimeMap(transcript);
		
		this.container  = this.__makeVideoDiv(source);

		this.video.ontimeupdate = this.__runTranscript.bind(this);
		this.video.onend = function(){
			var last = this.time_array[this.time_array.length -1];

		}
		// this.autoplay = true;

		this.paused = false;
		this.__keysset = false;
	}

	keyboardOn(){ /* Called by onEnter function in TutorialPage */
		if (this.__keysset === false){
			Keyboard.layerOn()
			Keyboard.addKeyPressTask(" ", this.pauseplay.bind(this));
			Keyboard.addKeyPressTask("ArrowLeft", this.goPrevTrans.bind(this,true));
			Keyboard.addKeyPressTask("ArrowRight", this.goNextTrans.bind(this,true));
			this.__keysset = true;
		}
	}

	keyboardOff(){
		if (this.__keysset === true){
			Keyboard.layerOff();
			this.__keysset = false;
		}
	}

	destroy(){ /* called by TutorialPage.destroy() */
		this.keyboardOff();

		while(this.container.firstChild){
			this.container.removeChild(this.container.firstChild);
		}
		this.container.parentNode.removeChild(this.container);
	}

	getVideo(){
		return this.container;
	}

	goPrevTrans(){
		if (this.__lastIndex - 1 < 0){
			return 0;
		}

		this.__nextTime = this.time_array[this.__lastIndex];

		var time = this.time_array[--this.__lastIndex];
		this.video.currentTime = time;
		this.__setText( this.transcript[time] )

		this.pauseVideo(true);
	}

	goNextTrans(){
		if (this.__lastIndex + 1 >= this.time_array.length){
			return 0;
		}

		var time = this.time_array[++this.__lastIndex];

		this.video.currentTime = time;
		this.__setText( this.transcript[time] );

		this.__nextTime = this.time_array[this.__lastIndex +1];
		this.pauseVideo(true);
	}


	__animatePlaySwitch(endicon){
		setTimeout(function(){

			setTimeout(function(){

			}, 100)

		},100);
		this.playicon
	}

	playVideo(user_set = false){ 
		this.paused = false;
		this.user_set = user_set;

		this.video.play();
		this.playicon.innerHTML = this.__symbolplay;


	}

	pauseVideo(user_set = false){
		this.paused = true;
		this.user_set = user_set;

		this.video.pause();

		this.playicon.style.display = "block";
		this.playicon.innerHTML = this.__symbolplay;

		var that = this;
		setTimeout(function(){
			that.playicon.innerHTML = that.__symbolpause;

			setTimeout(function(){
				that.playicon.style.display = "none";
			}, 200);
		}, 100)
	}


	pauseplay(){
		if (this.paused){
			console.log(this.paused, "play");
			this.playVideo();
		} else {
			console.log(this.paused, "pause");
			this.pauseVideo();
		}
	}


	__runTranscript(event)
	{
		// Too early, come back later
		if (event.target.currentTime < this.__nextTime){
			return 0;
		}

		//Screw it, just fire until caught up
		var currentTrans = this.transcript[
			this.time_array[this.__lastIndex]
		];
		this.__nextTime = this.time_array[++this.__lastIndex];

		this.__setText(currentTrans);
	}


	__setText(trans_at_time){

		var page  = this.pageTutor,
			video = this.video;

		var delay = trans_at_time[0],
			top   = trans_at_time[1],
			bot   = trans_at_time[2];

		if (top!==null){page.modifyTop(top)};
		if (bot!==null){page.modifyBot(bot)};

		this.pauseVideo();
		
/*		if (delay!==0){
			var that = this;
			//Function to highlight
			// top and bottom
			setTimeout(function(){
				if (!that.user_set){
					that.playVideo();
				}
			}, delay * 1000);
		}*/
	}


	__makeVideoDiv(src){
		var parent  = document.createElement('div'), /* relative */
			divmain = document.createElement('div'), /* absolute */
			med 	= document.createElement('video'),
			source  = document.createElement('source');
		
		med.controls = "";
		source.type  = "video/mp4";
		source.src   = src;
	

		parent.appendChild(divmain);
		med.appendChild(source);

		var div   = document.createElement('div'),
			play  = document.createElement('div'),
			prev  = document.createElement('button'),
			next  = document.createElement('button');


		parent.className  = 'videocontainer_parent';
		divmain.className = 'videocontainer';
		div.className     = "videobuttons";
		play.id           = 'vidplay';
		
		//div.appendChild(play);
		div.appendChild(prev);
		div.appendChild(next);

		parent.appendChild(play);
		

		divmain.appendChild(med);
		divmain.appendChild(div);

		play.innerHTML = this.__symbolplay;
		prev.innerHTML = '<'
		next.innerHTML = '>'

		play.title = " [ Spacebar ] "
		prev.title = " [   Left  ]"
		next.title = " [  Right  ]"

		med.onclick  = this.pauseplay.bind(this);
		play.onclick = this.pauseplay.bind(this);
		prev.onclick = this.goPrevTrans.bind(this);
		next.onclick = this.goNextTrans.bind(this);


		// Autoplay
/*		var that = this;
		
		var check = document.createElement('input'),
			label = document.createElement('label');
		
		div.appendChild(label);

		label.innerHTML = "autoplay";
		label.appendChild(check);
		
		check.type = "checkbox";
		check.checked = true;
		check.onchange = function(){
			that.autoplay = this.checked;
		}
*/

		this.playicon = play;
		this.video    = med;

		return parent;
	}


	static __makeTimeMap(transcript){
		return Object.keys(transcript).sort(
			function(a,b){
				return Number(a) - Number(b);
			}
		);
	}


	static __binarySearch(val, ordered_array){

		function binary_search(val, left, right) {
			if (left > right) return null;

			var mid = (left + right) >> 1; //div

		 	if (val == ordered_array[mid]) {
				return mid;
			} else if (val > ordered_array[mid]) {
				return binary_search(val, mid + 1, right);
			} else {
				return binary_search(val, left, mid - 1);
			}
		}
		return binary_search(val, 0, ordered_array.length - 1);
	}
}