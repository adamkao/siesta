var s = {
	ctx: 0,
	selpiece: '#sun',
	edgelist: [],
	sunedgelist: [],
	shaedgelist: [],
	cursor: { dir: 'n', x: 0, y: 0 },
	game: {
		thispiece: { red: 0, blu: 0 },
		thismove: { red: 0, blu: 0 },
		usermoves: ([
			[ -1, -1, -1 ],
			[ -1, -1, -1 ],
			[ -1, -1, -1 ] ]),
		compmoves: ([
			[ -1, -1, -1 ],
			[ -1, -1, -1 ],
			[ -1, -1, -1 ] ]),
		turn: 1,
		placed: 0,
		rem: { sun: 25, sha: 75, red: 15, blu: 15 },
		score: { red: 0, blu: 0 },
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
	},
	gamehistory: [],
};

function padnum( n ) {
	return ('  ' + n).slice( -2 )
}
function imgdrawat( piece, xsq, ysq ){
	s.ctx.drawImage( $( piece )[0], xsq*50 - 45 , ysq*50 - 45 )
}
function at() {
	return s.game.board[s.cursor.x][s.cursor.y]
}

function step() {
	if      (s.cursor.dir === 'n') s.cursor.y--;
	else if (s.cursor.dir === 'e') s.cursor.x++;
	else if (s.cursor.dir === 'w') s.cursor.x--;
	else if (s.cursor.dir === 's') s.cursor.y++;
}
function reverse() {
	if      (s.cursor.dir === 'n') s.cursor.dir = 's';
	else if (s.cursor.dir === 'e') s.cursor.dir = 'w';
	else if (s.cursor.dir === 'w') s.cursor.dir = 'e';
	else if (s.cursor.dir === 's') s.cursor.dir = 'n';
}
function bonuspts( present ) {
	if      (present.red) s.game.thispiece.red += 2;
	else if (present.blu) s.game.thispiece.blu += 2;
}
// step over any number of roofs, remembering what colors we hit
function skiproofs( present ) {
	while ((at() === 'r') || (at() === 'b')) {
		if      (at() === 'r') present.red = true;
		else if (at() === 'b') present.blu = true;
		step();
	}
}
// count and score shadows adding points to the colors present
function addpointsfrom( pointct, present, points ) {
	while (at() === 'h') {
		pointct++;
		step();
	}
	if (present.red) points.red += pointct;
	if (present.blu) points.blu += pointct;
}

function shafindsiesta( direction, xsq, ysq, points ) {
	var present = { red: false, blu: false };

	s.cursor = { dir: direction, x: xsq, y: ysq };

	do step();
	while (at() === 'h');

	if ((at() !== 'r') && (at() !== 'b')) {
		return false
	}

	skiproofs( present );

	if (at() === 'u') {
		s.cursor = { dir: direction, x: xsq, y: ysq };
		reverse();
		step();
		addpointsfrom( 1, present, points );
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

function updateedgelists() {
	var i, j, xsq, ysq, points = { red: 0, blu: 0 };

	// all empty squares adjacent to pieces are on the edgelist
	s.edgelist = [];
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			if ((s.game.board[i][j] === ' ') && haspieceadjacent( i, j )) {
				s.edgelist.push( [i, j] );
			}
		}
	}
	// all squares on the edgelist that are not adjacent to shadows are on the sunedgelist
	s.sunedgelist = [];
	for (i = 0; i < s.edgelist.length; i++) {
		xsq = s.edgelist[i][0]; ysq = s.edgelist[i][1];
		if (hasnoadjacent( 'h', xsq, ysq )) {
			s.sunedgelist.push( [xsq, ysq] );
		}
	}
	// all squares on the edgelist that are not adjacent to suns and can be part of a siesta are on the shaedgelist
	s.shaedgelist = [];
	for (i = 0; i < s.edgelist.length; i++) {
		xsq = s.edgelist[i][0]; ysq = s.edgelist[i][1];
		if (hasnoadjacent( 'u', xsq, ysq )) {
			if (shafindsiesta( 'n', xsq, ysq, points ) ||
				shafindsiesta( 'e', xsq, ysq, points ) ||
				shafindsiesta( 'w', xsq, ysq, points ) ||
				shafindsiesta( 's', xsq, ysq, points )) {
				s.shaedgelist.push( [xsq, ysq] );
			}
		}
	}
}
function findonlist( list, xsq, ysq ) {
	if (list) {
		for (i = 0; i < list.length; i++) {
			if ((list[i][0] === xsq) && (list[i][1] === ysq)) return true;
		}
	}
	return false
}

function drawboard() {
	var i;
	s.ctx.clearRect( 0, 0, 600, 600 );
	s.ctx.beginPath();
	for (i=0; i<13; i++) {
		s.ctx.moveTo( i*50 + .5, .5 );
		s.ctx.lineTo( i*50 + .5, 600.5 );
		s.ctx.moveTo( .5, i*50 + .5 );
		s.ctx.lineTo( 600.5, i*50 + .5 );
	}
	s.ctx.strokeStyle = 'black';
	s.ctx.lineWidth = 1;
	s.ctx.stroke();
}
function drawpieces() {
	var i, j, p;
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			p = s.game.board[i][j];
			if (p === 'r') {
				imgdrawat( '#red', i, j );
			} else if (p === 'b') {
				imgdrawat( '#blu', i, j );
			} else if (p === 'u') {
				imgdrawat( '#sun', i, j );
			} else if (p === 'h') {
				imgdrawat( '#sha', i, j );
			}
		}
	}
	if ((s.selpiece === '#sun') && (s.sunedgelist)) {
		for (i = 0; i < s.sunedgelist.length; i++) {
			imgdrawat( '#tar', s.sunedgelist[i][0], s.sunedgelist[i][1] )
		}
	} else if ((s.selpiece === '#sha') && (s.shaedgelist)) {
		for (i = 0; i < s.shaedgelist.length; i++) {
			imgdrawat( '#tar', s.shaedgelist[i][0], s.shaedgelist[i][1] )
		}
	} else if (s.edgelist) {
		for (i = 0; i < s.edgelist.length; i++) {
			imgdrawat( '#tar', s.edgelist[i][0], s.edgelist[i][1] )
		}
	}

	s.ctx.beginPath();

	i = s.game.compmoves[0][1];
	j = s.game.compmoves[0][2];
	s.ctx.moveTo( i*50 + .5, j*50 + .5 );
	s.ctx.lineTo( i*50 + .5, (j - 1)*50 - .5 );
	s.ctx.lineTo( (i - 1)*50 - .5, (j - 1)*50 - .5 );
	s.ctx.lineTo( (i - 1)*50 - .5, j*50 + .5 );
	s.ctx.lineTo( i*50 + .5, j*50 + .5 );
	i = s.game.compmoves[1][1];
	j = s.game.compmoves[1][2];
	s.ctx.moveTo( i*50 + .5, j*50 + .5 );
	s.ctx.lineTo( i*50 - .5, (j - 1)*50 - .5 );
	s.ctx.lineTo( (i - 1)*50 - .5, (j - 1)*50 - .5 );
	s.ctx.lineTo( (i - 1)*50 - .5, j*50 - .5 );
	s.ctx.lineTo( i*50 + .5, j*50 + .5 );
	i = s.game.compmoves[2][1];
	j = s.game.compmoves[2][2];
	s.ctx.moveTo( i*50 + .5, j*50 + .5 );
	s.ctx.lineTo( i*50 - .5, (j - 1)*50 - .5 );
	s.ctx.lineTo( (i - 1)*50 - .5, (j - 1)*50 - .5 );
	s.ctx.lineTo( (i - 1)*50 - .5, j*50 - .5 );
	s.ctx.lineTo( i*50 + .5, j*50 + .5 );

	s.ctx.strokeStyle = 'red';
	s.ctx.lineWidth = 3;
	s.ctx.stroke();

}
function showscore() {
	var outstr = '';
	var redstr = padnum( s.game.rem.red ) + ' rem ' + padnum( s.game.score.red ) + ' pts +';
	var blustr = padnum( s.game.rem.blu ) + ' rem ' + padnum( s.game.score.blu ) + ' pts +';

	if (s.game.placed < 3) {
		redstr += (s.game.thismove.red + s.game.thispiece.red);
		blustr += (s.game.thismove.blu + s.game.thispiece.blu);
	} else {
		redstr += s.game.thismove.red;
		blustr += s.game.thismove.blu;
		if (s.game.thismove.blu) {
			outstr = '<p>3 pieces placed, click done</p>';
		} else {
			outstr = '<p>You must score at least one point, click undo</p>';
		}
	}
	if (s.game.turn === 1) {
		if (s.game.placed === 0) {
			outstr += '<p>Place the first sun</p>'
			$( s.selpiece ).css( 'border', 'solid 3px white' );
			s.selpiece = '#sun';
			$( s.selpiece ).css( 'border', 'solid 3px green' );
		} else if (s.game.placed === 1) {
			outstr += '<p>Place the first roof</p>'
			$( s.selpiece ).css( 'border', 'solid 3px white' );
			s.selpiece = '#blu';
			$( s.selpiece ).css( 'border', 'solid 3px green' );
		} else if (s.game.placed === 2) {
			outstr += '<p>Place the first shadow</p>'
			$( s.selpiece ).css( 'border', 'solid 3px white' );
			s.selpiece = '#sha';
			$( s.selpiece ).css( 'border', 'solid 3px green' );
		}
	}
	outstr += ( '<p>Turn ' + s.game.turn + '</p><p>Pieces placed: ' + s.game.placed + '</p>' );
	$( '#output' ).html( outstr );
	$( '#sunct' ).html( padnum( s.game.rem.sun ) + ' rem ' );
	$( '#shact' ).html( padnum( s.game.rem.sha ) + ' rem ' );
	$( '#redct' ).html( redstr );
	$( '#bluct' ).html( blustr );
}

function updatedisplay() {
	$( '#sun' ).off( 'click' );
	if ((s.game.rem.sun === 0) && (s.selpiece === '#sun')) {
		$( s.selpiece ).css( 'border', 'solid 3px white' );
		s.selpiece = '#sha';
		$( s.selpiece ).css( 'border', 'solid 3px green' );
	} else {
		$( '#sun' ).click( function() {	switchselpiece( '#sun' ) } );
	}
	$( '#blu' ).off( 'click' );
	if ((s.game.rem.blu === 0) && (s.selpiece === '#blu')) {
		$( s.selpiece ).css( 'border', 'solid 3px white' );
		s.selpiece = '#sha';
		$( s.selpiece ).css( 'border', 'solid 3px green' );
	} else {
		$( '#blu' ).click( function() {	switchselpiece( '#blu' ) } );
	}
	drawboard();
	drawpieces();
	showscore();
}
function switchselpiece( id ) {
	$( s.selpiece ).css( 'border', 'solid 3px white' );
	s.selpiece = id;
	$( s.selpiece ).css( 'border', 'solid 3px green' );
	updatedisplay();
}
function domove( xsq, ysq ) {
	s.gamehistory.push( s.game );
	s.game = $.extend( true, {}, s.game );
	s.game.thismove.red += s.game.thispiece.red;
	s.game.thismove.blu += s.game.thispiece.blu;
	s.game.usermoves[s.game.placed] = [ s.selpiece, xsq, ysq ];
	if      (s.selpiece === '#sun') {
		s.game.rem.sun--;
		s.game.board[xsq][ysq] = 'u';
	}
	else if (s.selpiece === '#sha') {
		s.game.rem.sha--;
		s.game.board[xsq][ysq] = 'h';
	}
	else if (s.selpiece === '#red') {
		s.game.rem.red--;
		s.game.board[xsq][ysq] = 'r';
	}
	else if (s.selpiece === '#blu') {
		s.game.rem.blu--;
		s.game.board[xsq][ysq] = 'b';
	}
	s.game.placed++;
	$( '#undo' ).prop( 'disabled', false );
	if (s.game.placed === 3) {
		$( '#board' ).off( 'mousemove' );
		$( '#board' ).off( 'click' );
		s.edgelist = [];
		s.sunedgelist = [];
		s.shaedgelist = [];
		if (s.game.thismove.blu) {
			$( '#done' ).prop( 'disabled', false );
		}
	} else {
		updateedgelists();
	}
	updatedisplay();
}

function mousemove( e ) {
	var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 ), ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );
	showxsq = xsq; showysq = ysq;
	s.game.thispiece = { red: 0, blu: 0 };
	if      ((s.selpiece === '#sun') && findonlist( s.sunedgelist, xsq, ysq )) {
		findsunpoints( xsq, ysq, s.game.thispiece );
	} else if ((s.selpiece === '#sha') && findonlist( s.shaedgelist, xsq, ysq )) {
		findshapoints( xsq, ysq, s.game.thispiece );
	} else if (findonlist( s.edgelist, xsq, ysq )) {
		if      (s.selpiece === '#red') {
			present = { red: true, blu: false };
			findroofpoints( xsq, ysq, s.game.thispiece, present );
		}
		else if (s.selpiece === '#blu') {
			present = { red: false, blu: true };
			findroofpoints( xsq, ysq, s.game.thispiece, present );
		}
	}
	updatedisplay();
	imgdrawat( s.selpiece, xsq, ysq );
}
function click( e ) {
	var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 ), ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );
	if (s.game.board[xsq][ysq] !== ' ') return;
	else if ((s.selpiece === '#sun') && findonlist( s.sunedgelist, xsq, ysq )) {
		domove( xsq, ysq );
	}
	else if ((s.selpiece === '#sha') && findonlist( s.shaedgelist, xsq, ysq )) {
		domove( xsq, ysq );
	}
	else if (((s.selpiece === '#red') || (s.selpiece === '#blu')) && findonlist( s.edgelist, xsq, ysq )) {
		domove( xsq, ysq );
	}
}
function undo() {
	if (!s.gamehistory.length) return;
	s.game = s.gamehistory.pop();
	if (s.game.placed === 2) {
		$( '#done' ).prop( 'disabled', true );
		$( '#undo' ).prop( 'disabled', false );
		$( '#board' ).off( 'mousemove' );
		$( '#board' ).mousemove( mousemove );
		$( '#board' ).off( 'click' );
		$( '#board' ).click( click );
	} else if (s.game.placed === 0) {
		$( '#undo' ).prop( 'disabled', true );
		if (s.game.turn === 1) {
			$( '#board' ).off( 'mousemove' );
			$( '#board' ).mousemove( firstmousemove );
			$( '#board' ).off( 'click' );
			$( '#board' ).click( firstclick );
		}
	}
	updateedgelists();
	updatedisplay();
}
function done() {
	var outstr;
	s.gamehistory.push( s.game );
	s.game = $.extend( true, {}, s.game );
	s.game.score.red += s.game.thismove.red;
	s.game.score.blu += s.game.thismove.blu;
	s.game.thismove = { red: 0, blu: 0 };
	if ((s.game.rem.sun === 0) || (s.game.rem.sha === 0) || (s.game.rem.blu === 0)) {
		$( '#undo' ).prop( 'disabled', true );
		$( '#done' ).prop( 'disabled', true );
		$( '#board' ).off( 'click' );
		$( '#board' ).off( 'mousemove' );
		$( '#board' ).off( 'mouseleave' );
		updatedisplay();
		if (s.game.score.blu > s.game.score.red) {
			$( '#output' ).html( '<h3>You win!</h3>' );
		} else if (s.game.score.blu < s.game.score.red) {
			$( '#output' ).html( '<h3>Computer wins!</h3>' );

		} else {
			$( '#output' ).html( '<h3>Tie game!</h3>' );
		}
		$( '#sun' ).off( 'click' );
		$( '#sha' ).off( 'click' );
		$( '#blu' ).off( 'click' );
		return;
	}
	s.game.turn++;
	s.game.placed = 0;
	$( '#undo' ).prop( 'disabled', true );
	$( '#done' ).prop( 'disabled', true );
	$( '#board' ).mousemove( mousemove );
	$( '#board' ).click( click );
	$( '#sun' ).click( function() {	switchselpiece( '#sun' ) } );
	$( '#sha' ).click( function() {	switchselpiece( '#sha' ) } );
	$( '#blu' ).click( function() {	switchselpiece( '#blu' ) } );
	updateedgelists();
	if (docompmove()) {
		updateedgelists();
		updatedisplay();
	} else {
		updatedisplay();
		if (s.game.score.blu > s.game.score.red) {
			$( '#output' ).html( '<h3>You win!</h3>' );
		} else if (s.game.score.blu < s.game.score.red) {
			$( '#output' ).html( '<h3>Computer wins!</h3>' );
		} else {
			$( '#output' ).html( '<h3>Tie game!</h3>' );
		}
		$( '#sun' ).off( 'click' );
		$( '#sha' ).off( 'click' );
		$( '#blu' ).off( 'click' );
	}
}

function firstmousemove( e ) {
	var i, j;
	drawboard();
	if (s.selpiece !== '#sha') {
		for (i = 1; i <= 12; i++) {
			for (j = 1; j <= 12; j++) {
				imgdrawat( '#tar', i, j );
			}
		}
	}
	imgdrawat( s.selpiece,
		Math.ceil( (e.pageX - this.offsetLeft)/50 ),
		Math.ceil( (e.pageY - this.offsetTop)/50 ) );
}
function firstclick( e ) {
	var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 ), ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );
	if ((s.game.board[xsq][ysq] !== ' ') || (s.selpiece === '#sha')) return;
	s.gamehistory.push( s.game );
	s.game = $.extend( true, {}, s.game );
	s.game.board[xsq][ysq] = 'u';
	if      (s.selpiece === '#sun') s.game.rem.sun--;
	else if (s.selpiece === '#red') s.game.rem.red--;
	else if (s.selpiece === '#blu') s.game.rem.blu--;
	s.game.placed = 1;
	showscore();
	updateedgelists();
	$( '#undo' ).prop( 'disabled', false );
	$( '#board' ).off( 'mousemove' );
	$( '#board' ).mousemove( mousemove );
	$( '#board' ).off( 'click' );
	$( '#board' ).click( click );
}

function undocompmove() {
	s.game = s.gamehistory.pop();
	updateedgelists();
	updatedisplay();
}

function docompmove() {
	var i, j, k, x, y;
	var candidatemove = { scoredelta: 0, piece1: 'r', edgelist1: 0, piece2: 'u', edgelist2: 0, piece3: 'h', edgelist3: 0 };
	var newcandidatemove = { scoredelta: 0, piece1: 'r', edgelist1: 0, piece2: 'u', edgelist2: 0, piece3: 'h', edgelist3: 0 };

	for (i = 0; i < s.edgelist.length; i++) {
		newcandidatemove.edgelist1 = i;

		s.gamehistory.push( s.game );
		s.game = $.extend( true, {}, s.game );
		s.game.thismove = { red: 0, blu: 0 };

		x = s.edgelist[i][0], y = s.edgelist[i][1];
		s.game.board[x][y] = 'r';
		present = { red: true, blu: false };
		s.game.thispiece = { red: 0, blu: 0 };
		findroofpoints( x, y, s.game.thispiece, present )
		s.game.thismove.red += s.game.thispiece.red;
		s.game.thismove.blu += s.game.thispiece.blu;
		s.game.compmoves[0] = [ 'r', x, y ]

		updateedgelists();

		for (j = 0; j < s.sunedgelist.length; j++) {
			newcandidatemove.edgelist2 = j;

			s.gamehistory.push( s.game );
			s.game = $.extend( true, {}, s.game );

			x = s.sunedgelist[j][0], y = s.sunedgelist[j][1];
			s.game.board[x][y] = 'u';
			present = { red: true, blu: false };
			s.game.thispiece = { red: 0, blu: 0 };
			findsunpoints( x, y, s.game.thispiece, present )
			s.game.thismove.red += s.game.thispiece.red;
			s.game.thismove.blu += s.game.thispiece.blu;
			s.game.compmoves[1] = [ 'u', x, y ]

			updateedgelists();

			if (s.shaedgelist.length) {

				for (k = 0; k < s.shaedgelist.length; k++) {
					newcandidatemove.edgelist3 = k;

					s.gamehistory.push( s.game );
					s.game = $.extend( true, {}, s.game );

					x = s.shaedgelist[k][0], y = s.shaedgelist[k][1];
					s.game.board[x][y] = 'h';
					s.game.thispiece = { red: 0, blu: 0 };
					findshapoints( x, y, s.game.thispiece );
					s.game.thismove.red += s.game.thispiece.red;
					s.game.thismove.blu += s.game.thispiece.blu;
					s.game.compmoves[2] = [ 'h', x, y ]
					newcandidatemove.scoredelta = s.game.thismove.red - s.game.thismove.blu;
					if (newcandidatemove.scoredelta > candidatemove.scoredelta) {
						candidatemove = $.extend( true, {}, newcandidatemove );
					}
					s.game = s.gamehistory.pop();
					updateedgelists();
				}
			}
			s.game = s.gamehistory.pop();
			updateedgelists();
		}
		s.game = s.gamehistory.pop();
		updateedgelists();
	}
	s.game.thismove = { red: 0, blu: 0 };

	x = s.edgelist[candidatemove.edgelist1][0], y = s.edgelist[candidatemove.edgelist1][1];
	s.game.board[x][y] = 'r';
	present = { red: true, blu: false };
	s.game.thispiece = { red: 0, blu: 0 };
	findroofpoints( x, y, s.game.thispiece, present )
	s.game.thismove.red += s.game.thispiece.red;
	s.game.thismove.blu += s.game.thispiece.blu;
	s.game.compmoves[0] = [ 'r', x, y ]
	updateedgelists();

	x = s.sunedgelist[candidatemove.edgelist2][0], y = s.sunedgelist[candidatemove.edgelist2][1];
	s.game.board[x][y] = 'u';
	present = { red: true, blu: false };
	s.game.thispiece = { red: 0, blu: 0 };
	findsunpoints( x, y, s.game.thispiece, present )
	s.game.thismove.red += s.game.thispiece.red;
	s.game.thismove.blu += s.game.thispiece.blu;
	s.game.compmoves[1] = [ 'u', x, y ]
	updateedgelists();

	x = s.shaedgelist[candidatemove.edgelist3][0], y = s.shaedgelist[candidatemove.edgelist3][1];
	s.game.board[x][y] = 'h';
	s.game.thispiece = { red: 0, blu: 0 };
	findshapoints( x, y, s.game.thispiece );
	s.game.thismove.red += s.game.thispiece.red;
	s.game.thismove.blu += s.game.thispiece.blu;
	s.game.compmoves[2] = [ 'h', x, y ]
	updateedgelists();

	s.gamehistory.push( s.game );
	s.game = $.extend( true, {}, s.game );
	s.game.score.red += s.game.thismove.red;
	s.game.score.blu += s.game.thismove.blu;
	s.game.thispiece = { red: 0, blu: 0 };
	s.game.thismove = { red: 0, blu: 0 };
	s.game.rem.sun--;
	s.game.rem.red--;
	s.game.rem.sha--;
	if ((s.game.rem.sun === 0) || (s.game.rem.sha === 0) || (s.game.rem.red === 0)) {
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
	s.ctx = document.getElementById( 'board' ).getContext( '2d' );
	s.selpiece = '#sun';
	$( s.selpiece ).css( 'border', 'solid 3px green' );
	$( '#board' ).mousemove( firstmousemove );
	$( '#board' ).click( firstclick );
	$( '#board' ).mouseleave( updatedisplay );
	updatedisplay();
});
