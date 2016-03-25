'use strict';

(function(){

	function padNum( n ) {
		return ('  ' + n).slice( -2 )
	}

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
	function findEdge( head, x, y ) {
		var iterNode = head.nx;
		while (iterNode.x) {
			if ((iterNode.x === x) && (iterNode.y === y)) {
				return true
			}
			iterNode = iterNode.nx
		}
		return false
	}


	var ctx = 0;

	function drawImgAt( piece, xsq, ysq ){
		ctx.drawImage( $( piece )[0], xsq*50 - 45 , ysq*50 - 45 )
	}


	var selected = '#sun';

	function switchSelected( id ) {
		$( selected ).css( 'border', 'solid 3px white' );
		selected = id;
		$( selected ).css( 'border', 'solid 3px green' );
	}
	function handleSelect( id ) {
		switchSelected( id );
		updateDisplay();
	}


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
			[ 'b', 0, 0 ]
		]),
		compPlaced: ([
			[ 'r', 0, 0 ],
			[ 'r', 0, 0 ],
			[ 'r', 0, 0 ]
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
			[ '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-' ]
		]),

		edgeList: new edgeNode( 0, 0 ),
		uEdgeList: new edgeNode( 0, 0 ),
		hEdgeList: new edgeNode( 0, 0 ),

		edgeMap: ([
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
		]),
	};

	function addNewEdges( xsq, ysq ) {
		var newNode;

		if (g.edgeMap[xsq][ysq-1] === 0) {
			newNode = new edgeNode( xsq, ysq-1 );
			g.edgeMap[xsq][ysq-1] = newNode;
			addNode( g.edgeList, newNode );
		}
		if (g.edgeMap[xsq+1][ysq] === 0) {
			newNode = new edgeNode( xsq+1, ysq );
			g.edgeMap[xsq+1][ysq] = newNode;
			addNode( g.edgeList, newNode );
		}
		if (g.edgeMap[xsq-1][ysq] === 0) {
			newNode = new edgeNode( xsq-1, ysq );
			g.edgeMap[xsq-1][ysq] = newNode;
			addNode( g.edgeList, newNode );
		}
		if (g.edgeMap[xsq][ysq+1] === 0) {
			newNode = new edgeNode( xsq, ysq+1 );
			g.edgeMap[xsq][ysq+1] = newNode;
			addNode( g.edgeList, newNode );
		}
	}

	var gHistory = [];


	var cursor = { d: 'n', x: 0, y: 0 };

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

		do step(); while (at() === 'h');				// walk past shadows

		if ((at() !== 'r') && (at() !== 'b')) { // if this is not a roof
			return false 													// there is no siesta
		}

		skipRoofs( present );										// walk past roofs

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

		do step(); while (at() === 'h');

		if ((at() !== 'r') && (at() !== 'b')) {
			return false
		}

		skipRoofs( present );

		if ((present.r && present.b) || (at() !== 'u')) {
			return false
		}

		cursor = { d: d, x: xsq, y: ysq };
		rev();

		do step(); while (at() === 'h');

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
		var iterNode = g.edgeList.nx;
		var xsq, ysq;
		var points = { r: 0, b: 0 };

		g.uEdgeList.pr = g.uEdgeList.nx = g.uEdgeList;
		g.hEdgeList.pr = g.hEdgeList.nx = g.hEdgeList;

		while (iterNode.x) {
			xsq = iterNode.x;
			ysq = iterNode.y;
			if (hasNoAdjacent( 'h', xsq, ysq )) {
				// all squares on the edgelist that are not adjacent to shadows
				// go on the uEdgelist
				addNode( g.uEdgeList, new edgeNode( xsq, ysq ) );
			}
			if (hasNoAdjacent( 'u', xsq, ysq )) {
				// all squares on the edgelist that are not adjacent to suns
				if (
					findShaSiesta( 'n', xsq, ysq, points ) ||
					findShaSiesta( 'e', xsq, ysq, points ) ||
					findShaSiesta( 'w', xsq, ysq, points ) ||
					findShaSiesta( 's', xsq, ysq, points )
				) {
					// and can be part of a siesta go on the hEdgelist
					addNode( g.hEdgeList, new edgeNode( xsq, ysq ) );
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
				if 				(p === 'r') {
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

		if (g.placed !== 3) {
			if 				(selected === '#sun') {
				iterNode = g.uEdgeList.nx;
			} else if (selected === '#sha') {
				iterNode = g.hEdgeList.nx;
			} else {
				iterNode = g.edgeList.nx;
			}
			while (iterNode.x) {
				drawImgAt( '#tar', iterNode.x, iterNode.y );
				iterNode = iterNode.nx;
			}
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
			padNum( g.score.r ) + ' pts +'
		);
		var bluStr = (
			padNum( g.remaining.b ) + ' rem ' +
			padNum( g.score.b ) + ' pts +'
		);

		if (g.placed < 3) {
			redStr += (g.thisMove.r + g.thisPiece.r);
			bluStr += (g.thisMove.b + g.thisPiece.b);
		} else {
			redStr += g.thisMove.r;
			bluStr += g.thisMove.b;
			if (g.thisMove.b) {
				outStr = '<p>3 pieces placed, click done</p>';
			} else {
				outStr = '<p>You must score at least one point, click undo</p>';
			}
		}
		if (g.turn === 1) {
			if (g.placed === 0) {
				outStr = '<p>Place the first sun</p>'
				switchSelected( '#sun' );
			} else if (g.placed === 1) {
				outStr = '<p>Place the first roof</p>'
				switchSelected( '#blu' );
			} else if (g.placed === 2) {
				outStr = '<p>Place the first shadow</p>'
				switchSelected( '#sha' );
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

		drawBoard();
		drawPieces();
		showScore();

		if (g.placed === 0) {
			$( '#undo' ).prop( 'disabled', true );
			$( '#done' ).prop( 'disabled', true );
		} else if (g.placed === 3) {
			$( '#undo' ).prop( 'disabled', false );
			if (g.thisMove.b) {
				$( '#done' ).prop( 'disabled', false );
			} else {
				$( '#done' ).prop( 'disabled', true );
			}
		} else {
			$( '#undo' ).prop( 'disabled', false );
			$( '#done' ).prop( 'disabled', true );
		}
	}


	function doMove( xsq, ysq ) {

		gHistory.push( g );
		g = $.extend( true, {}, g );
		g.thisMove.r += g.thisPiece.r;
		g.thisMove.b += g.thisPiece.b;
		g.thisPiece.r = 0;
		g.thisPiece.b = 0;

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
		if (g.placed === 3) {
			$( '#board' ).off( 'mousemove' );
			$( '#board' ).off( 'click' );
		}

		snipNode( g.edgeMap[xsq][ysq] );
		g.edgeMap[xsq][ysq] = 1;
		addNewEdges( xsq, ysq );
		updateEdgeLists();
		updateDisplay();
	}

	function mousemove( e ) {
		var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 );
		var ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );

		g.thisPiece = { r: 0, b: 0 };
		if 				((selected === '#sun') && findEdge( g.uEdgeList, xsq, ysq )) {
			findSunPoints( xsq, ysq, g.thisPiece );
		} else if ((selected === '#sha') && findEdge( g.hEdgeList, xsq, ysq )) {
			findShaPoints( xsq, ysq, g.thisPiece );
		} else if (findEdge( g.edgeList, xsq, ysq )) {
			present = { r: false, b: true };
			findRoofPoints( xsq, ysq, g.thisPiece, present );
		}
		updateDisplay();
		drawImgAt( selected, xsq, ysq );
	}

	function click( e ) {
		var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 );
		var ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );

		if (g.board[xsq][ysq] !== ' ') return;

		else if ((selected === '#sun') && findEdge( g.uEdgeList, xsq, ysq )) {
			doMove( xsq, ysq );
		}
		else if ((selected === '#sha') && findEdge( g.hEdgeList, xsq, ysq )) {
			doMove( xsq, ysq );
		}
		else if (findEdge( g.edgeList, xsq, ysq )) {
			doMove( xsq, ysq );
		}
	}

	function undo() {
		if (!gHistory.length) return;

		g = gHistory.pop();
		g.edgeList = new edgeNode( 0, 0 );
		g.uEdgeList = new edgeNode( 0, 0 );
		g.hEdgeList = new edgeNode( 0, 0 );

		if ((g.turn === 1) && (g.placed === 0)) {
			$( '#board' ).off( 'mousemove' );
			$( '#board' ).mousemove( firstMousemove );
			$( '#board' ).off( 'click' );
			$( '#board' ).click( firstClick );
		}
		else if (g.placed === 2) {
			$( '#board' ).mousemove( mousemove );
			$( '#board' ).click( click );
		}

		updateDisplay();
	}


	function endGame() {

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
		$( '#undo' ).prop( 'disabled', true );
		$( '#done' ).prop( 'disabled', true );
		$( '#board' ).off( 'click' );
		$( '#board' ).off( 'mousemove' );
		$( '#board' ).off( 'mouseleave' );
	}


	function done() {
		alert( 'hi' );
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
			'#sun',
			Math.ceil( (e.pageX - this.offsetLeft)/50 ),
			Math.ceil( (e.pageY - this.offsetTop)/50 )
		);
	}


	function firstClick( e ) {
		var newNode;
		var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 );
		var ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );

		gHistory.push( g );
		g = $.extend( true, {}, g );
		g.board[xsq][ysq] = 'u';
		g.remaining.u--;
		g.placed = 1;
		showScore();

		g.edgeMap[xsq][ysq] = 1;
		addNewEdges( xsq, ysq );

		$( '#undo' ).prop( 'disabled', false );
		$( '#board' ).off( 'mousemove' );
		$( '#board' ).mousemove( mousemove );
		$( '#board' ).off( 'click' );
		$( '#board' ).click( click );
	}


	function doCompMove() {
		return true;
	}


	$( document ).ready( function() {
		ctx = document.getElementById( 'board' ).getContext( '2d' );
		selected = '#sun';
		$( selected ).css( 'border', 'solid 3px green' );
		$( '#board' ).mousemove( firstMousemove );
		$( '#board' ).click( firstClick );
		$( '#board' ).mouseleave( updateDisplay );
		$( '#undo' ).click( undo );
		$( '#done' ).click( done );
		updateDisplay();
	});

})();
