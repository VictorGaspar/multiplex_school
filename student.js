(function() {

	var multiplex = Reveal.getConfig().multiplex;
	var socketId = multiplex.id;
	var socket = io.connect(multiplex.url);
	let maxSlideH = 0;
	let maxSlideV = 0;
	let maxSlideF = undefined;
	indices = Reveal.getIndices();
	let currentSlideH = indices.h;
	let currentSlideV = indices.v;
	let currentSlideF = indices.f;

	socket.on(multiplex.id, function(message) {
		// ignore data from sockets that aren't ours
		if (message.socketId !== socketId) { return; }

		if ( message.state ) {
			if (message.state.indexh !== undefined && message.state.indexv !== undefined) {
				maxSlideH = Math.max(maxSlideH, message.state.indexh);
				maxSlideV = Math.max(maxSlideV, message.state.indexv);
				if (message.state.indexf !== undefined) {
					if (maxSlideF === undefined) {
						maxSlideF = message.state.indexf;
					} else {
						maxSlideF = Math.max(maxSlideF, message.state.indexf);
					}
				} else {
					maxSlideF = undefined;
				}
			}
			Reveal.setState(message.state);
		}
		if ( message.content ) {
			// forward custom events to other plugins
			var event = new CustomEvent('received');
			event.content = message.content;
			document.dispatchEvent( event );
		}
	});

	function checkSlideAndCorrect(event) {
		if (event.type === 'slidechanged') {
			currentSlideH = event.indexh;
			currentSlideV = event.indexv;
			if (currentSlideH > maxSlideH || (currentSlideH === maxSlideH && currentSlideV > maxSlideV))
				Reveal.slide(maxSlideH, maxSlideV, maxSlideF);
		} else if (event.type === 'fragmentshown') {
			currentSlideF = parseInt(event.fragment.attributes['data-fragment-index'].value);
		} else if (event.type === 'fragmenthidden') {
			currentSlideF = parseInt(event.fragment.attributes['data-fragment-index'].value) - 1;
		}

		// If the teacher has not yet navigated to the requested fragment, correct the student to the last known fragment
		if (event.type === 'fragmentshown' && 
			(currentSlideH >= maxSlideH || 
			currentSlideV >= maxSlideV) && 
			(maxSlideF === undefined ||
			currentSlideF > maxSlideF)
		) {
			Reveal.slide(maxSlideH, maxSlideV, maxSlideF);
		}
	}

	Reveal.addEventListener('slidechanged', checkSlideAndCorrect);
	Reveal.addEventListener('fragmentshown', checkSlideAndCorrect);
	Reveal.addEventListener('fragmenthidden', checkSlideAndCorrect);
}());
