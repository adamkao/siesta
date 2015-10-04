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

	var aEdgeList = null;
	var uEdgeList = null;
	var hEdgeList = null;

	var ctx = 0;
	var selected = '#sun';

	var cursor: { dir: 'n', x: 0, y: 0 };

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
		if      (cursor.dir === 'n') cursor.y--;
		else if (cursor.dir === 'e') cursor.x++;
		else if (cursor.dir === 'w') cursor.x--;
		else if (cursor.dir === 's') cursor.y++;
	}
	function rev() {
		if      (cursor.dir === 'n') cursor.dir = 's';
		else if (cursor.dir === 'e') cursor.dir = 'w';
		else if (cursor.dir === 'w') cursor.dir = 'e';
		else if (cursor.dir === 's') cursor.dir = 'n';
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

	function findShaSiesta( direction, xsq, ysq, points ) {
		var present = { r: false, b: false };

		cursor = { dir: direction, x: xsq, y: ysq };

		do step();
		while (at() === 'h');

		if ((at() !== 'r') && (at() !== 'b')) {
			return false
		}

		skipRoofs( present );

		if (at() === 'u') {
			cursor = { dir: direction, x: xsq, y: ysq };
			rev();
			step();
			addShaPoints( 1, present, points );
			return true
		}
		return false
	}
	function findshadouble( dir, xsq, ysq, present ) {
		s.cursor = { dir: dir, x: xsq, y: ysq };

		do step();
		while (at() === 'h');

		if ((at() !== 'r') && (at() !== 'b')) {
			return false
		}

		skiproofs( present );

		if ((present.red && present.blu) || (at() !== 'u')) {
			return false
		}

		s.cursor = { dir: dir, x: xsq, y: ysq };
		reverse();

		do step();
		while (at() === 'h');

		if ((at() !== 'r') && (at() !== 'b')) {
			return false
		}

		skiproofs( present );

		if ((present.red && present.blu) || (at() !== 'u')) {
			return false
		}

		return true
	}
	function findshapoints( xsq, ysq, points ) {
		var present = {};

		shafindsiesta( 'n', xsq, ysq, points );
		shafindsiesta( 'e', xsq, ysq, points );
		shafindsiesta( 'w', xsq, ysq, points );
		shafindsiesta( 's', xsq, ysq, points );

		present = { red: false, blu: false };
		if (findshadouble( 'n', xsq, ysq, present )) {
			bonuspts( present );
		}
		present = { red: false, blu: false };
		if (findshadouble( 'e', xsq, ysq, present )) {
			bonuspts( present );
		}
	}

	function sunfindsiesta( direction, xsq, ysq, points ) {
		var present = { red: false, blu: false };

		s.cursor = { dir: direction, x: xsq, y: ysq };

		step();
		skiproofs( present );

		if (at() !== 'h') {
			return
		}

		addpointsfrom( 0, present, points );
	}
	function findsundouble( dir, xsq, ysq, present ) {
		var points = { red:0, blu: 0 };

		s.cursor = { dir: dir, x: xsq, y: ysq };

		step();
		skiproofs( present );

		if ((present.red && present.blu) || (at() !== 'h')) {
			return false
		}

		addpointsfrom( 0, present, points );

		skiproofs( present );

		if ((present.red && present.blu) || (at() !== 'u')) {
			return false
		}

		return true
	}
	function findsunpoints( xsq, ysq, points ) {
		var present = {};

		sunfindsiesta( 'n', xsq, ysq, points );
		sunfindsiesta( 'e', xsq, ysq, points );
		sunfindsiesta( 'w', xsq, ysq, points );
		sunfindsiesta( 's', xsq, ysq, points );

		present = { red: false, blu: false };
		if (findsundouble( 'n', xsq, ysq, present )) {
			bonuspts( present );
		}
		present = { red: false, blu: false };
		if (findsundouble( 'e', xsq, ysq, present )) {
			bonuspts( present );
		}
		present = { red: false, blu: false };
		if (findsundouble( 'w', xsq, ysq, present )) {
			bonuspts( present );
		}
		present = { red: false, blu: false };
		if (findsundouble( 's', xsq, ysq, present )) {
			bonuspts( present );
		}
	}

	function rooffindsiesta( direction, xsq, ysq, present, points ) {
		s.cursor = { dir: direction, x: xsq, y: ysq };
		tpres = present;

		step();
		skiproofs( tpres );

		if (at() !== 'u') {
			return
		}

		s.cursor = { dir: direction, x: xsq, y: ysq };
		reverse();

		step();
		skiproofs( tpres );

		if (at() !== 'h') {
			return
		}

		addpointsfrom( 0, tpres, points );
	}
	function findroofdouble( dir, xsq, ysq, present ) {
		var points = { red:0, blu: 0 };

		s.cursor = { dir: dir, x: xsq, y: ysq };

		step();
		skiproofs( present );

		if ((present.red && present.blu) || (at() !== 'u')) {
			return false
		}

		s.cursor = { dir: dir, x: xsq, y: ysq };
		reverse();

		step();
		skiproofs( present );

		if ((present.red && present.blu) || (at() !== 'h')) {
			return false
		}

		addpointsfrom( 0, present, points );

		skiproofs( present );

		if ((present.red && present.blu) || (at() !== 'u')) {
			return false
		}

		return true
	}
	function findroofpoints( xsq, ysq, points, present ) {

		rooffindsiesta( 'n', xsq, ysq, present, points );
		rooffindsiesta( 'e', xsq, ysq, present, points );
		rooffindsiesta( 'w', xsq, ysq, present, points );
		rooffindsiesta( 's', xsq, ysq, present, points );

		tpres = present;
		if (findroofdouble( 'n', xsq, ysq, tpres )) {
			bonuspts( tpres );
		}
		tpres = present;
		if (findroofdouble( 'e', xsq, ysq, tpres )) {
			bonuspts( tpres );
		}
		tpres = present;
		if (findroofdouble( 'w', xsq, ysq, tpres )) {
			bonuspts( tpres );
		}
		tpres = present;
		if (findroofdouble( 's', xsq, ysq, tpres )) {
			bonuspts( tpres );
		}
	}

	function haspieceadjacent( xsq, ysq ) {
		var np = s.game.board[xsq][ysq-1];
		var ep = s.game.board[xsq-1][ysq];
		var wp = s.game.board[xsq+1][ysq];
		var sp = s.game.board[xsq][ysq+1];
		return (
			((np !== ' ') && (np !== '-') && (np !== '+')) ||
			((ep !== ' ') && (ep !== '-') && (np !== '+')) ||
			((wp !== ' ') && (wp !== '-') && (np !== '+')) ||
			((sp !== ' ') && (sp !== '-') && (np !== '+'))
		)
	}
	function hasnoadjacent( type, xsq, ysq ) {
		return (
			(s.game.board[xsq-1][ysq] !== type) &&
			(s.game.board[xsq+1][ysq] !== type) &&
			(s.game.board[xsq][ysq-1] !== type) &&
			(s.game.board[xsq][ysq+1] !== type)
		)
	}

})();
