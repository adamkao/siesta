(function(){

	var ctx = 0;
	var selected = '#sun';

	var g = {

		turn: 1,
		placed: 0,
		remaining: { u: 25, h: 75, r: 15, b: 15 },

		score: { r: 0, b: 0 },
		thisPiece: { r: 0, b: 0 },
		thisMove: { r: 0, b: 0 },

		userPlaced: ([
			[ 'b', 0, 0 ],
			[ 'b', 0, 0 ],
			[ 'b', 0, 0 ],
		]),
		compPlaced: ([
			[ 'r', 0, 0 ],
			[ 'r', 0, 0 ],
			[ 'r', 0, 0 ],
		]),

		board: ([
			[ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-' ],
			[ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-' ],
		]),
	};

	var gHistory = [];

	function edgeNode( x, y ) {
		this.x = x;
		this.y = y;
		this.pr = this;
		this.nx = this;
	}
	function snipNode( en ) {
		en.pr.nx = en.nx;
		en.nx.pr = en.pr;
	}
	function addNode( head, en ) {
		var tail = head.pr;
		tail.nx = en;
		en.pr = tail;
		en.nx = head;
		head.pr = en;
	}
	var edgeList = new edgeNode( 0, 0 );
	var uEdgeList = new edgeNode( 0, 0 );
	var hEdgeList = new edgeNode( 0, 0 );

	var edgeMap: ([
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	]),

	function padNum( n ) {
		return ('  ' + n).slice( -2 )
	}
	function drawImgAt( piece, xsq, ysq ){
		ctx.drawImage( $( piece )[0], xsq*50 - 45 , ysq*50 - 45 )
	}

	var cursor: { d: 'n', x: 0, y: 0 };

	function at() {
		return g.board[cursor.x][cursor.y]
	}
	function step() {
		if      (cursor.d === 'n') cursor.y--;
		else if (cursor.d === 'e') cursor.x++;
		else if (cursor.d === 'w') cursor.x--;
		else if (cursor.d === 's') cursor.y++;
	}
	function rev() {
		if      (cursor.d === 'n') cursor.d = 's';
		else if (cursor.d === 'e') cursor.d = 'w';
		else if (cursor.d === 'w') cursor.d = 'e';
		else if (cursor.d === 's') cursor.d = 'n';
	}

	function addBonus( present ) {
		if      (present.r) g.thisPiece.r += 2;
		else if (present.b) g.thisPiece.b += 2;
	}
	// step over any number of roofs, remembering what colors we hit
	function skipRoofs( present ) {
		while ((at() === 'r') || (at() === 'b')) {
			if      (at() === 'r') present.r = true;
			else if (at() === 'b') present.b = true;
			step();
		}
	}
	// count and score shadows adding points to the colors present
	function addShaPoints( pointCount, present, points ) {
		while (at() === 'h') {
			pointCount++;
			step();
		}
		if (present.r) points.r += pointCount;
		if (present.b) points.b += pointCount;
	}

	function findShaSiesta( d, xsq, ysq, points ) {
		var present = { r: false, b: false };

		cursor = { d: d, x: xsq, y: ysq };

		do step();
		while (at() === 'h');										// walk past shadows

		if ((at() !== 'r') && (at() !== 'b')) { // if this is not a roof
			return false 													// there is no siesta
		}

		skipRoofs( present );

		if (at() === 'u') {											// if this is a sun
			cursor = { d: d, x: xsq, y: ysq };		// go back to the start square
			rev();
			step();
			addShaPoints( 1, present, points );		// count pts including this one
			return true
		}
		return false
	}

	function findShaDouble( d, xsq, ysq, present ) {

		cursor = { d: d, x: xsq, y: ysq };

		do step();
		while (at() === 'h');

		if ((at() !== 'r') && (at() !== 'b')) {
			return false
		}

		skipRoofs( present );

		if ((present.r && present.b) || (at() !== 'u')) {
			return false
		}

		cursor = { d: d, x: xsq, y: ysq };
		rev();

		do step();
		while (at() === 'h');

		if ((at() !== 'r') && (at() !== 'b')) {
			return false
		}

		skipRoofs( present );

		if ((present.r && present.b) || (at() !== 'u')) {
			return false
		}

		return true
	}

	function findShaPoints( xsq, ysq, points ) {
		var present = {};

		findShaSiesta( 'n', xsq, ysq, points );
		findShaSiesta( 'e', xsq, ysq, points );
		findShaSiesta( 'w', xsq, ysq, points );
		findShaSiesta( 's', xsq, ysq, points );

		present = { r: false, b: false };
		if (findShaDouble( 'n', xsq, ysq, present )) {
			addBonus( present );
		}
		present = { r: false, b: false };
		if (findShaDouble( 'e', xsq, ysq, present )) {
			addBonus( present );
		}
	}

	function findSunSiesta( d, xsq, ysq, points ) {
		var present = { r: false, b: false };

		cursor = { d: d, x: xsq, y: ysq };

		step();
		skipRoofs( present );

		if (at() !== 'h') {
			return
		}

		addShaPoints( 0, present, points );
	}

	function findSunDouble( d, xsq, ysq, present ) {
		var points = { r: 0, b: 0 };

		cursor = { d: d, x: xsq, y: ysq };

		step();
		skipRoofs( present );

		if ((present.r && present.b) || (at() !== 'h')) {
			return false
		}

		addShaPoints( 0, present, points );

		skipRoofs( present );

		if ((present.r && present.b) || (at() !== 'u')) {
			return false
		}

		return true
	}

	function findSunPoints( xsq, ysq, points ) {
		var present = {};

		findSunSiesta( 'n', xsq, ysq, points );
		findSunSiesta( 'e', xsq, ysq, points );
		findSunSiesta( 'w', xsq, ysq, points );
		findSunSiesta( 's', xsq, ysq, points );

		present = { r: false, b: false };
		if (findSunDouble( 'n', xsq, ysq, present )) {
			addBonus( present );
		}
		present = { r: false, b: false };
		if (findSunDouble( 'e', xsq, ysq, present )) {
			addBonus( present );
		}
		present = { r: false, b: false };
		if (findSunDouble( 'w', xsq, ysq, present )) {
			addBonus( present );
		}
		present = { r: false, b: false };
		if (findSunDouble( 's', xsq, ysq, present )) {
			addBonus( present );
		}
	}

	function findRoofSiesta( d, xsq, ysq, present, points ) {
		var tpres = present;

		cursor = { d: d, x: xsq, y: ysq };

		step();
		skipRoofs( tpres );

		if (at() !== 'u') {
			return
		}

		cursor = { d: d, x: xsq, y: ysq };
		rev();

		step();
		skipRoofs( tpres );

		if (at() !== 'h') {
			return
		}

		addShaPoints( 0, tpres, points );
	}

	function findRoofDouble( d, xsq, ysq, present ) {
		var points = { r: 0, b: 0 };

		cursor = { d: d, x: xsq, y: ysq };

		step();
		skipRoofs( present );

		if ((present.r && present.b) || (at() !== 'u')) {
			return false
		}

		cursor = { d: d, x: xsq, y: ysq };
		rev();

		step();
		skipRoofs( present );

		if ((present.r && present.b) || (at() !== 'h')) {
			return false
		}

		addShaPoints( 0, present, points );

		skipRoofs( present );

		if ((present.r && present.b) || (at() !== 'u')) {
			return false
		}

		return true
	}

	function findRoofPoints( xsq, ysq, points, present ) {
		var tpres;

		findRoofSiesta( 'n', xsq, ysq, present, points );
		findRoofSiesta( 'e', xsq, ysq, present, points );
		findRoofSiesta( 'w', xsq, ysq, present, points );
		findRoofSiesta( 's', xsq, ysq, present, points );

		tpres = present;
		if (findRoofDouble( 'n', xsq, ysq, tpres )) {
			addBonus( tpres );
		}
		tpres = present;
		if (findRoofDouble( 'e', xsq, ysq, tpres )) {
			addBonus( tpres );
		}
		tpres = present;
		if (findRoofDouble( 'w', xsq, ysq, tpres )) {
			addBonus( tpres );
		}
		tpres = present;
		if (findRoofDouble( 's', xsq, ysq, tpres )) {
			addBonus( tpres );
		}
	}

	function hasNoAdjacent( type, xsq, ysq ) {
		return (
			(g.board[xsq-1][ysq] !== type) &&
			(g.board[xsq+1][ysq] !== type) &&
			(g.board[xsq][ysq-1] !== type) &&
			(g.board[xsq][ysq+1] !== type)
		)
	}
	function updateEdgeLists() {
		var iterNode = edgeList.nx;
		var xsq, ysq;
		var points = { r: 0, b: 0 };

		uEdgeList.pr = uEdgeList.nx = uEdgeList;
		hEdgeList.pr = hEdgeList.nx = hEdgeList;

		while (iterNode.x) {
			xsq = iterNode.x;
			ysq = iterNode.y;
			if (hasnoadjacent( 'h', xsq, ysq )) {
				// all squares on the edgelist that are not adjacent to shadows
				// go on the uEdgelist
				addNode( uEdgelist, new edgeNode( xsq, ysq ) );
			}
			if (hasnoadjacent( 'u', xsq, ysq )) {
				// all squares on the edgelist that are not adjacent to suns
				if (
					shafindsiesta( 'n', xsq, ysq, points ) ||
					shafindsiesta( 'e', xsq, ysq, points ) ||
					shafindsiesta( 'w', xsq, ysq, points ) ||
					shafindsiesta( 's', xsq, ysq, points )
				) {
					// and can be part of a siesta go on the hEdgelist
					addNode( hEdgeList, new edgeNode( xsq, ysq ) );
				}
			}
			iterNode = iterNode.nx;
		}
	}

	function drawBoard() {
		var i;
		ctx.clearRect( 0, 0, 600, 600 );
		ctx.beginPath();
		for (i=0; i<13; i++) {
			ctx.moveTo( i*50 + .5, .5 );
			ctx.lineTo( i*50 + .5, 600.5 );
			ctx.moveTo( .5, i*50 + .5 );
			ctx.lineTo( 600.5, i*50 + .5 );
		}
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.stroke();
	}
	function drawPieces() {
		var i, j, p, iterNode;

		for (i = 1; i <= 12; i++) {
			for (j = 1; j <= 12; j++) {
				p = g.board[i][j];
				if (p === 'r') {
					drawImgAt( '#red', i, j );
				} else if (p === 'b') {
					drawImgAt( '#blu', i, j );
				} else if (p === 'u') {
					drawImgAt( '#sun', i, j );
				} else if (p === 'h') {
					drawImgAt( '#sha', i, j );
				}
			}
		}

		if (selected === '#sun') {
			iterNode = uEdgeList.nx;
		} else if (selected === '#sha') {
			iterNode = hEdgeList.nx;
		} else {
			iterNode = edgeList.nx;
		}
		while (iterNode.x) {
			drawImgAt( '#tar', iterNode.x, iterNode.y );
			iterNode = iterNode.nx;
		}

		ctx.beginPath();

		i = g.compPlaced[0][1];
		j = g.compPlaced[0][2];
		ctx.moveTo( i*50 + .5, j*50 + .5 );
		ctx.lineTo( i*50 + .5, (j - 1)*50 - .5 );
		ctx.lineTo( (i - 1)*50 - .5, (j - 1)*50 - .5 );
		ctx.lineTo( (i - 1)*50 - .5, j*50 + .5 );
		ctx.lineTo( i*50 + .5, j*50 + .5 );
		i = g.compPlaced[1][1];
		j = g.compPlaced[1][2];
		ctx.moveTo( i*50 + .5, j*50 + .5 );
		ctx.lineTo( i*50 - .5, (j - 1)*50 - .5 );
		ctx.lineTo( (i - 1)*50 - .5, (j - 1)*50 - .5 );
		ctx.lineTo( (i - 1)*50 - .5, j*50 - .5 );
		ctx.lineTo( i*50 + .5, j*50 + .5 );
		i = g.compPlaced[2][1];
		j = g.compPlaced[2][2];
		ctx.moveTo( i*50 + .5, j*50 + .5 );
		ctx.lineTo( i*50 - .5, (j - 1)*50 - .5 );
		ctx.lineTo( (i - 1)*50 - .5, (j - 1)*50 - .5 );
		ctx.lineTo( (i - 1)*50 - .5, j*50 - .5 );
		ctx.lineTo( i*50 + .5, j*50 + .5 );

		ctx.strokeStyle = 'red';
		ctx.lineWidth = 3;
		ctx.stroke();
	}
	function showScore() {
		var outStr = '';
		var redStr = (
			padNum( g.remaining.r ) + ' rem ' +
			padNum( g.score.r ) + ' pts +';
		)
		var bluStr = (
			padNum( g.remaining.b ) + ' rem ' +
			padNum( g.score.b ) + ' pts +';
		)

		if (g.placed < 3) {
			redStr += (g.thisMove.r + g.thisPiece.r);
			bluStr += (g.thisMove.b + g.thisPiece.b);
		} else {
			redStr += g.thisMove.r;
			bluStr += g.thisMove.b;
			if (g.thisMove.b) {
				outstr = '<p>3 pieces placed, click done</p>';
			} else {
				outstr = '<p>You must score at least one point, click undo</p>';
			}
		}
		if (g.turn === 1) {
			if (g.placed === 0) {
				outstr = '<p>Place the first sun</p>'
				$( selected ).css( 'border', 'solid 3px white' );
				selected = '#sun';
				$( selected ).css( 'border', 'solid 3px green' );
			} else if (g.placed === 1) {
				outstr = '<p>Place the first roof</p>'
				$( selected ).css( 'border', 'solid 3px white' );
				selected = '#blu';
				$( selected ).css( 'border', 'solid 3px green' );
			} else if (g.placed === 2) {
				outstr = '<p>Place the first shadow</p>'
				$( selected ).css( 'border', 'solid 3px white' );
				selected = '#sha';
				$( selected ).css( 'border', 'solid 3px green' );
			}
		}
		outStr += (
			'<p>Turn ' + g.turn +
			'</p><p>Pieces placed: ' + g.placed + '</p>'
		);
		$( '#output' ).html( outStr );
		$( '#sunct' ).html( padNum( g.remaining.u ) + ' rem ' );
		$( '#shact' ).html( padNum( g.remaining.h ) + ' rem ' );
		$( '#redct' ).html( redStr );
		$( '#bluct' ).html( bluStr );
	}

	function updateDisplay() {
		$( '#sun' ).off( 'click' );
		if ((g.remaining.u === 0) && (selected === '#sun')) {
			$( selected ).css( 'border', 'solid 3px white' );
			selected = '#sha';
			$( selected ).css( 'border', 'solid 3px green' );
		} else {
			$( '#sun' ).click( function() {	switchselpiece( '#sun' ) } );
		}
		$( '#blu' ).off( 'click' );
		if ((g.remaining.b === 0) && (selected === '#blu')) {
			$( selected ).css( 'border', 'solid 3px white' );
			selected = '#sha';
			$( selected ).css( 'border', 'solid 3px green' );
		} else {
			$( '#blu' ).click( function() {	switchselpiece( '#blu' ) } );
		}
		drawBoard();
		drawPieces();
		showScore();
	}
	function switchselpiece( id ) {
		$( selected ).css( 'border', 'solid 3px white' );
		selected = id;
		$( selected ).css( 'border', 'solid 3px green' );
		updateDisplay();
	}
	function doMove( xsq, ysq ) {
		gHistory.push( g );
		g = $.extend( true, {}, g );
		g.thisMove.r += g.thisPiece.r;
		g.thisMove.b += g.thisPiece.b;
		if      (selected === '#sun') {
			g.remaining.u--;
			g.board[xsq][ysq] = 'u';
			g.userPlaced[g.placed] = [ 'u', xsq, ysq ];
		}
		else if (selected === '#sha') {
			g.remaining.h--;
			g.board[xsq][ysq] = 'h';
			g.userPlaced[g.placed] = [ 'h', xsq, ysq ];
		}
		else if (selected === '#blu') {
			g.remaining.b--;
			g.board[xsq][ysq] = 'b';
			g.userPlaced[g.placed] = [ 'b', xsq, ysq ];
		}
		g.placed++;
		$( '#undo' ).prop( 'disabled', false );
		if (g.placed === 3) {
			$( '#board' ).off( 'mousemove' );
			$( '#board' ).off( 'click' );
			if (g.thisMove.b) {
				$( '#done' ).prop( 'disabled', false );
			}
		} else {
			updateEdgeLists();
		}
		updateDisplay();
	}

	function mousemove( e ) {
		var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 );
		var ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );

		g.thisPiece = { r: 0, b: 0 };
		if      ((selected === '#sun') && findonlist( s.sunedgelist, xsq, ysq )) {
			findSunPoints( xsq, ysq, g.thisPiece );
		} else if ((selected === '#sha') && findonlist( s.shaedgelist, xsq, ysq )) {
			findShaPoints( xsq, ysq, g.thisPiece );
		} else if (findonlist( s.edgelist, xsq, ysq )) {
			if      (selected === '#red') {
				present = { r: true, b: false };
				findRoofPoints( xsq, ysq, g.thisPiece, present );
			}
			else if (selected === '#blu') {
				present = { r: false, b: true };
				findRoofPoints( xsq, ysq, g.thisPiece, present );
			}
		}
		updateDisplay();
		drawImgAt( selected, xsq, ysq );
	}
	function click( e ) {
		var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 );
		var ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );

		if (g.board[xsq][ysq] !== ' ') return;

		else if ((selected === '#sun') && findonlist( s.sunedgelist, xsq, ysq )) {
			doMove( xsq, ysq );
		}
		else if ((selected === '#sha') && findonlist( s.shaedgelist, xsq, ysq )) {
			doMove( xsq, ysq );
		}
		else if (((selected === '#red') || (selected === '#blu')) && findonlist( s.edgelist, xsq, ysq )) {
			doMove( xsq, ysq );
		}
	}
	function undo() {
		if (!gHistory.length) return;
		g = gHistory.pop();
		if (g.placed === 2) {
			$( '#done' ).prop( 'disabled', true );
			$( '#undo' ).prop( 'disabled', false );
			$( '#board' ).off( 'mousemove' );
			$( '#board' ).mousemove( mousemove );
			$( '#board' ).off( 'click' );
			$( '#board' ).click( click );
		} else if (g.placed === 0) {
			$( '#undo' ).prop( 'disabled', true );
			if (g.turn === 1) {
				$( '#board' ).off( 'mousemove' );
				$( '#board' ).mousemove( firstMousemove );
				$( '#board' ).off( 'click' );
				$( '#board' ).click( firstClick );
			}
		}
		updateEdgeLists();
		updateDisplay();
	}

	function done() {
		var outStr;

		gHistory.push( g );
		g = $.extend( true, {}, g );
		g.score.r += g.thisMove.r;
		g.score.b += g.thisMove.b;
		g.thisMove = { r: 0, b: 0 };
		if (
			(g.remaining.u === 0) ||
			(g.remaining.h === 0) ||
			(g.remaining.b === 0)
		) {
			$( '#undo' ).prop( 'disabled', true );
			$( '#done' ).prop( 'disabled', true );
			$( '#board' ).off( 'click' );
			$( '#board' ).off( 'mousemove' );
			$( '#board' ).off( 'mouseleave' );
			updateDisplay();
			if (g.score.b > g.score.r) {
				$( '#output' ).html( '<h3>You win!</h3>' );
			} else if (g.score.b < g.score.r) {
				$( '#output' ).html( '<h3>Computer wins!</h3>' );
			} else {
				$( '#output' ).html( '<h3>Tie game!</h3>' );
			}
			$( '#sun' ).off( 'click' );
			$( '#sha' ).off( 'click' );
			$( '#blu' ).off( 'click' );
			return
		}
		g.turn++;
		g.placed = 0;
		$( '#undo' ).prop( 'disabled', true );
		$( '#done' ).prop( 'disabled', true );
		$( '#board' ).mousemove( mousemove );
		$( '#board' ).click( click );
		$( '#sun' ).click( function() {	switchselpiece( '#sun' ) } );
		$( '#sha' ).click( function() {	switchselpiece( '#sha' ) } );
		$( '#blu' ).click( function() {	switchselpiece( '#blu' ) } );
		updateEdgeLists();
		if (docompmove()) {
			updateEdgeLists();
			updateDisplay();
		} else {
			updateDisplay();
			if (g.score.b > g.score.r) {
				$( '#output' ).html( '<h3>You win!</h3>' );
			} else if (g.score.b < g.score.r) {
				$( '#output' ).html( '<h3>Computer wins!</h3>' );
			} else {
				$( '#output' ).html( '<h3>Tie game!</h3>' );
			}
			$( '#sun' ).off( 'click' );
			$( '#sha' ).off( 'click' );
			$( '#blu' ).off( 'click' );
		}
	}

	function firstMousemove( e ) {
		var i, j;
		drawBoard();
		for (i = 1; i <= 12; i++) {
			for (j = 1; j <= 12; j++) {
				drawImgAt( '#tar', i, j );
			}
		}
		drawImgAt(
			selected,
			Math.ceil( (e.pageX - this.offsetLeft)/50 ),
			Math.ceil( (e.pageY - this.offsetTop)/50 )
		);
	}
	function firstClick( e ) {
		var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 );
		var ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );
		gHistory.push( g );
		g = $.extend( true, {}, g );
		g.board[xsq][ysq] = 'u';
		g.remaining.u--;
		g.placed = 1;
		showScore();
		updateEdgeLists();
		$( '#undo' ).prop( 'disabled', false );
		$( '#board' ).off( 'mousemove' );
		$( '#board' ).mousemove( mousemove );
		$( '#board' ).off( 'click' );
		$( '#board' ).click( click );
	}

	function undocompmove() {
		g = gHistory.pop();
		updateEdgeLists();
	}

	function docompmove() {
		var i, j, k, x, y;
		var candidatemove = { scoredelta: 0, piece1: 'r', edgelist1: 0, piece2: 'u', edgelist2: 0, piece3: 'h', edgelist3: 0 };
		var newcandidatemove = { scoredelta: 0, piece1: 'r', edgelist1: 0, piece2: 'u', edgelist2: 0, piece3: 'h', edgelist3: 0 };

		for (i = 0; i < s.edgelist.length; i++) {
			newcandidatemove.edgelist1 = i;

			gHistory.push( g );
			g = $.extend( true, {}, g );
			g.thismove = { r: 0, b: 0 };

			x = s.edgelist[i][0], y = s.edgelist[i][1];
			g.board[x][y] = 'r';
			present = { r: true, b: false };
			g.thisPiece = { r: 0, b: 0 };
			findRoofPoints( x, y, g.thisPiece, present )
			g.thisMove.r += g.thisPiece.red;
			g.thisMove.b += g.thisPiece.blu;
			g.compmoves[0] = [ 'r', x, y ]

			updateEdgeLists();

			for (j = 0; j < s.sunedgelist.length; j++) {
				newcandidatemove.edgelist2 = j;

				gHistory.push( g );
				g = $.extend( true, {}, g );

				x = s.sunedgelist[j][0], y = s.sunedgelist[j][1];
				g.board[x][y] = 'u';
				present = { r: true, b: false };
				g.thisPiece = { r: 0, b: 0 };
				findSunPoints( x, y, g.thisPiece, present )
				g.thisMove.r += g.thisPiece.red;
				g.thisMove.b += g.thisPiece.blu;
				g.compmoves[1] = [ 'u', x, y ]

				updateEdgeLists();

				if (s.shaedgelist.length) {

					for (k = 0; k < s.shaedgelist.length; k++) {
						newcandidatemove.edgelist3 = k;

						gHistory.push( g );
						g = $.extend( true, {}, g );

						x = s.shaedgelist[k][0], y = s.shaedgelist[k][1];
						g.board[x][y] = 'h';
						g.thisPiece = { r: 0, b: 0 };
						findShaPoints( x, y, g.thisPiece );
						g.thisMove.r += g.thisPiece.red;
						g.thisMove.b += g.thisPiece.blu;
						g.compmoves[2] = [ 'h', x, y ]
						newcandidatemove.scoredelta = g.thisMove.r - g.thisMove.b;
						if (newcandidatemove.scoredelta > candidatemove.scoredelta) {
							candidatemove = $.extend( true, {}, newcandidatemove );
						}
						g = gHistory.pop();
						updateEdgeLists();
					}
				}
				g = gHistory.pop();
				updateEdgeLists();
			}
			g = gHistory.pop();
			updateEdgeLists();
		}
		g.thismove = { r: 0, b: 0 };

		x = s.edgelist[candidatemove.edgelist1][0], y = s.edgelist[candidatemove.edgelist1][1];
		g.board[x][y] = 'r';
		present = { r: true, b: false };
		g.thisPiece = { r: 0, b: 0 };
		findRoofPoints( x, y, g.thisPiece, present )
		g.thisMove.r += g.thisPiece.red;
		g.thisMove.b += g.thisPiece.blu;
		g.compmoves[0] = [ 'r', x, y ]
		updateEdgeLists();

		x = s.sunedgelist[candidatemove.edgelist2][0], y = s.sunedgelist[candidatemove.edgelist2][1];
		g.board[x][y] = 'u';
		present = { r: true, b: false };
		g.thisPiece = { r: 0, b: 0 };
		findSunPoints( x, y, g.thisPiece, present )
		g.thisMove.r += g.thisPiece.red;
		g.thisMove.b += g.thisPiece.blu;
		g.compmoves[1] = [ 'u', x, y ]
		updateEdgeLists();

		x = s.shaedgelist[candidatemove.edgelist3][0], y = s.shaedgelist[candidatemove.edgelist3][1];
		g.board[x][y] = 'h';
		g.thisPiece = { r: 0, b: 0 };
		findShaPoints( x, y, g.thisPiece );
		g.thisMove.r += g.thisPiece.red;
		g.thisMove.b += g.thisPiece.blu;
		g.compmoves[2] = [ 'h', x, y ]
		updateEdgeLists();

		gHistory.push( g );
		g = $.extend( true, {}, g );
		g.score.r += g.thisMove.r;
		g.score.b += g.thisMove.b;
		g.thisPiece = { r: 0, b: 0 };
		g.thismove = { r: 0, b: 0 };
		g.remaining.u--;
		g.remaining.r--;
		g.remaining.h--;
		if ((g.remaining.u === 0) || (g.remaining.h === 0) || (g.remaining.r === 0)) {
			$( '#undo' ).prop( 'disabled', true );
			$( '#done' ).prop( 'disabled', true );
			$( '#board' ).off( 'click' );
			$( '#board' ).off( 'mousemove' );
			$( '#board' ).off( 'mouseleave' );
			return false;
		}
		return true;
	}

	$( document ).ready( function() {
		ctx = document.getElementById( 'board' ).getContext( '2d' );
		selected = '#sun';
		$( selected ).css( 'border', 'solid 3px green' );
		$( '#board' ).mousemove( firstMousemove );
		$( '#board' ).click( firstClick );
		$( '#board' ).mouseleave( updateDisplay );
		updateDisplay();
	});

})();
