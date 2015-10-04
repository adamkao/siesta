(function(){

	var gameState = {

		turn: 1,
		placed: 0,
		remaining: { u: 25, h: 75, r: 15, b: 15 },

		score: { r: 0, b: 0 },
		thisPiece: { r: 0, b: 0 },
		thisMove: { r: 0, b: 0 },

		userMoves: ([
			[ 0, 0, 'b' ],
			[ 0, 0, 'b' ],
			[ 0, 0, 'b' ],
		]),
		compMoves: ([
			[ 0, 0, 'r' ],
			[ 0, 0, 'r' ],
			[ 0, 0, 'r' ],
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

	var gameHistory = [];

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

	var edgeMap: ([
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

	var edgeList = new edgeNode( 0, 0 );
	var uEdgeList = new edgeNode( 0, 0 );
	var hEdgeList = new edgeNode( 0, 0 );

	var ctx = 0;
	var selected = '#sun';

	var cursor: { d: 'n', x: 0, y: 0 };

	function padNum( n ) {
		return ('  ' + n).slice( -2 )
	}
	function drawImgAt( piece, xsq, ysq ){
		ctx.drawImage( $( piece )[0], xsq*50 - 45 , ysq*50 - 45 )
	}
	function at() {
		return gameState.board[cursor.x][cursor.y]
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
		if      (present.r) gameState.thisPiece.r += 2;
		else if (present.b) gameState.thisPiece.b += 2;
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

	function hasPieceAdjacent( xsq, ysq ) {
		var np = gameState.board[xsq][ysq-1];
		var ep = gameState.board[xsq-1][ysq];
		var wp = gameState.board[xsq+1][ysq];
		var sp = gameState.board[xsq][ysq+1];
		return (
			((np !== ' ') && (np !== '-')) ||
			((ep !== ' ') && (ep !== '-')) ||
			((wp !== ' ') && (wp !== '-')) ||
			((sp !== ' ') && (sp !== '-'))
		)
	}
	function hasNoAdjacent( type, xsq, ysq ) {
		return (
			(gameState.board[xsq-1][ysq] !== type) &&
			(gameState.board[xsq+1][ysq] !== type) &&
			(gameState.board[xsq][ysq-1] !== type) &&
			(gameState.board[xsq][ysq+1] !== type)
		)
	}

})();
