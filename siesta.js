var s = {
	ctx: 0,
	selpiece: '#sun',
	placed: 0,
	rem: { sun: 25, sha: 75, red: 15, blu: 15 },
	score: { red: 0, blu: 0 },
	thismove: { red: 0, blu: 0 },
	edgelist: [],
	sunedgelist: [],
	shaedgelist: [],
	cursor: { dir: 'n', x: 0, y: 0 },
	board: ([ [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1 ],
		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ] ]),
	boardhistory: []
};

function padnum( n ) {return ('  ' + n).slice( -2 )}
function imgdrawat( piece, xsq, ysq ) {s.ctx.drawImage( $( piece )[0], xsq*50 - 45 , ysq*50 - 45 )}
function at() {return s.board[s.cursor.x][s.cursor.y]}

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
	if      (present.red) s.thismove.red += 2;
	else if (present.blu) s.thismove.blu += 2;
}
// step over any number of roofs, remembering what colors we hit
function skiproofs( present ) {
	while ((at() === '#red') || (at() === '#blu')) {
		if      (at() === '#red') present.red = true;
		else if (at() === '#blu') present.blu = true;
		step();
	}
}
// count and score shadows adding points to the colors present
function addpointsfrom( pointct, present, points ) {
	while (at() === '#sha') {
		pointct++;
		step();
	}
	if (present.red) points.red += pointct;
	if (present.blu) points.blu += pointct;
}

function shafindsiesta( direction, xsq, ysq, points ) {
	var present = { red: false, blu: false };
	s.cursor = { dir: direction, x: xsq, y: ysq };
	do step(); while (at() === '#sha');
	if ((at() !== '#red') && (at() !== '#blu')) return false;
	skiproofs( present );
	if (at() === '#sun') {
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
	do step(); while (at() === '#sha');
	if ((at() !== '#red') && (at() !== '#blu')) return false;
	skiproofs( present );
	if ((present.red && present.blu) || (at() !== '#sun')) return false;
	s.cursor = { dir: dir, x: xsq, y: ysq };
	reverse();
	do step(); while (at() === '#sha');
	if ((at() !== '#red') && (at() !== '#blu')) return false;
	skiproofs( present );
	if ((present.red && present.blu) || (at() !== '#sun')) return false;
	return true
}
function findshapoints( xsq, ysq, points ) {
	var present = {};
	shafindsiesta( 'n', xsq, ysq, points );
	shafindsiesta( 'e', xsq, ysq, points );
	shafindsiesta( 'w', xsq, ysq, points );
	shafindsiesta( 's', xsq, ysq, points );
	present = { red: false, blu: false };
	if (findshadouble( 'n', xsq, ysq, present )) bonuspts( present );
	present = { red: false, blu: false };
	if (findshadouble( 'e', xsq, ysq, present )) bonuspts( present );
}

function sunfindsiesta( direction, xsq, ysq, points ) {
	var present = { red: false, blu: false };
	s.cursor = { dir: direction, x: xsq, y: ysq };
	step();
	skiproofs( present );
	if (at() !== '#sha') return;
	addpointsfrom( 0, present, points );
}
function findsundouble( dir, xsq, ysq, present ) {
	var points = { red:0, blu: 0 };
	s.cursor = { dir: dir, x: xsq, y: ysq };
	step();
	skiproofs( present );
	if ((present.red && present.blu) || (at() !== '#sha')) return false;
	addpointsfrom( 0, present, points );
	skiproofs( present );
	if ((present.red && present.blu) || (at() !== '#sun')) return false;
	return true
}
function findsunpoints( xsq, ysq, points ) {
	var present = {};
	sunfindsiesta( 'n', xsq, ysq, points );
	sunfindsiesta( 'e', xsq, ysq, points );
	sunfindsiesta( 'w', xsq, ysq, points );
	sunfindsiesta( 's', xsq, ysq, points );
	present = { red: false, blu: false };
	if (findsundouble( 'n', xsq, ysq, present )) bonuspts( present );
	present = { red: false, blu: false };
	if (findsundouble( 'e', xsq, ysq, present )) bonuspts( present );
	present = { red: false, blu: false };
	if (findsundouble( 'w', xsq, ysq, present )) bonuspts( present );
	present = { red: false, blu: false };
	if (findsundouble( 's', xsq, ysq, present )) bonuspts( present );
}

function rooffindsiesta( direction, xsq, ysq, present, points ) {
	s.cursor = { dir: direction, x: xsq, y: ysq };
	tpres = present;
	step();
	skiproofs( tpres );
	if (at() !== '#sun') return;
	s.cursor = { dir: direction, x: xsq, y: ysq };
	reverse();
	step();
	skiproofs( tpres );
	if (at() !== '#sha') return;
	addpointsfrom( 0, tpres, points );
}
function findroofdouble( dir, xsq, ysq, present ) {
	var points = { red:0, blu: 0 };
	s.cursor = { dir: dir, x: xsq, y: ysq };
	step();
	skiproofs( present );
	if ((present.red && present.blu) || (at() !== '#sun')) return false;
	s.cursor = { dir: dir, x: xsq, y: ysq };
	reverse();
	step();
	skiproofs( present );
	if ((present.red && present.blu) || (at() !== '#sha')) return false;
	addpointsfrom( 0, present, points );
	skiproofs( present );
	if ((present.red && present.blu) || (at() !== '#sun')) return false;
	return true
}
function findroofpoints( xsq, ysq, points, present ) {
	rooffindsiesta( 'n', xsq, ysq, present, points );
	rooffindsiesta( 'e', xsq, ysq, present, points );
	rooffindsiesta( 'w', xsq, ysq, present, points );
	rooffindsiesta( 's', xsq, ysq, present, points );
	tpres = present;
	if (findroofdouble( 'n', xsq, ysq, tpres )) bonuspts( tpres );
	tpres = present;
	if (findroofdouble( 'e', xsq, ysq, tpres )) bonuspts( tpres );
	tpres = present;
	if (findroofdouble( 'w', xsq, ysq, tpres )) bonuspts( tpres );
	tpres = present;
	if (findroofdouble( 's', xsq, ysq, tpres )) bonuspts( tpres );
}

function haspieceadjacent( xsq, ysq ) {
	return (((s.board[xsq-1][ysq] !== 0) && (s.board[xsq-1][ysq] !== -1))
		|| ((s.board[xsq+1][ysq] !== 0) && (s.board[xsq+1][ysq] !== -1))
		|| ((s.board[xsq][ysq-1] !== 0) && (s.board[xsq][ysq-1] !== -1))
		|| ((s.board[xsq][ysq+1] !== 0) && (s.board[xsq][ysq+1] !== -1)))
}
function hasnoadjacent( type, xsq, ysq ) {
	return ((s.board[xsq-1][ysq] !== type)
		&& (s.board[xsq+1][ysq] !== type)
		&& (s.board[xsq][ysq-1] !== type)
		&& (s.board[xsq][ysq+1] !== type))
}

function updateedgelists() {
	var i, xsq, ysq, points = { red: 0, blu: 0 };
	// all empty squares adjacent to pieces are on the edgelist
	s.edgelist = [];
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			if ((s.board[i][j] === 0) && haspieceadjacent( i, j )) {
				s.edgelist.push( [i, j] );
			}
		}
	}
	// all squares on the edgelist that are not adjacent to shadows are on the sunedgelist
	s.sunedgelist = [];
	for (i = 0; i < s.edgelist.length; i++) {
		xsq = s.edgelist[i][0]; ysq = s.edgelist[i][1];
		if (hasnoadjacent( '#sha', xsq, ysq )) {
			s.sunedgelist.push( [xsq, ysq] );			
		}
	}
	// all squares on the edgelist that are not adjacent to suns and can be part of a siesta are on the shaedgelist
	s.shaedgelist = [];
	for (i = 0; i < s.edgelist.length; i++) {
		xsq = s.edgelist[i][0]; ysq = s.edgelist[i][1];
		if (hasnoadjacent( '#sun', xsq, ysq )
			&& (shafindsiesta( 'n', xsq, ysq, points )
				|| shafindsiesta( 'e', xsq, ysq, points )
				|| shafindsiesta( 'w', xsq, ysq, points )
				|| shafindsiesta( 's', xsq, ysq, points ))) {
			s.shaedgelist.push( [xsq, ysq] );
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
	var i, j;
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			if (s.board[i][j] !== 0) imgdrawat( s.board[i][j], i, j );
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
}
function showscore() {
	$( '#output' ).html( 'Pieces placed: ' + s.placed );
	$( '#sunct' ).html( padnum( s.rem.sun ) + ' rem ' );
	$( '#shact' ).html( padnum( s.rem.sha ) + ' rem ' );
	$( '#redct' ).html( padnum( s.rem.red ) + ' rem ' + padnum( s.score.red ) + ' pts +' + s.thismove.red );
	$( '#bluct' ).html( padnum( s.rem.blu ) + ' rem ' + padnum( s.score.blu ) + ' pts +' + s.thismove.blu );
}

function updatedisplay() {
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
	s.boardhistory.push( s.board );
	s.board = $.extend( true, [], s.board );
	s.board[xsq][ysq] = s.selpiece;
	if      (s.selpiece === '#sun') s.rem.sun--;
	else if (s.selpiece === '#sha') s.rem.sha--;
	else if (s.selpiece === '#red') s.rem.red--;
	else if (s.selpiece === '#blu') s.rem.blu--;
	s.placed++;
	s.score.red += s.thismove.red;
	s.score.blu += s.thismove.blu;
	updateedgelists();
	updatedisplay();
}

function mousemove( e ) {
	var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 ), ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );
	s.thismove = { red: 0, blu: 0 };
	if      ((s.selpiece === '#sun') && findonlist( s.sunedgelist, xsq, ysq )) {
		findsunpoints( xsq, ysq, s.thismove );		
	}
	else if ((s.selpiece === '#sha') && findonlist( s.shaedgelist, xsq, ysq )) findshapoints( xsq, ysq, s.thismove );
	else if (findonlist( s.edgelist, xsq, ysq )) {
		if      (s.selpiece === '#red') {
			present = { red: true, blu: false };
			findroofpoints( xsq, ysq, s.thismove, present );
		}				
		else if (s.selpiece === '#blu') {
			present = { red: false, blu: true };
			findroofpoints( xsq, ysq, s.thismove, present );
		}
	}
	updatedisplay();
	imgdrawat( s.selpiece, xsq, ysq );
}
function click( e ) {
	var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 ), ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );
	if (s.board[xsq][ysq] !== 0) return;
	else if ((s.selpiece === '#sun') && findonlist( s.sunedgelist, xsq, ysq )) domove( xsq, ysq );
	else if ((s.selpiece === '#sha') && findonlist( s.shaedgelist, xsq, ysq )) domove( xsq, ysq );
	else if (((s.selpiece === '#red') || (s.selpiece === '#blu'))
		&& findonlist( s.edgelist, xsq, ysq )) domove( xsq, ysq );
}
function undo() {
	s.board = s.boardhistory.pop();
	updateedgelists();
	updatedisplay();
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
	if (s.board[xsq][ysq] !== 0) return;
	if      (s.selpiece === '#sun') s.rem.sun--;
	else if (s.selpiece === '#red') s.rem.red--;
	else if (s.selpiece === '#blu') s.rem.blu--;
	else return;
	s.boardhistory.push( s.board );
	s.board = $.extend( true, [], s.board );
	s.board[xsq][ysq] = s.selpiece;
	s.placed = 1;
	showscore();
	updateedgelists();
	$( '#board' ).off( 'mousemove' );
	$( '#board' ).mousemove( mousemove );
	$( '#board' ).off( 'click' );
	$( '#board' ).click( click );
}
$( document ).ready( function() {
	s.ctx = document.getElementById( 'board' ).getContext( '2d' );
	s.selpiece = '#sun';
	$( s.selpiece ).css( 'border', 'solid 3px green' );
	$( '#board' ).mousemove( firstmousemove );
	$( '#board' ).click( firstclick );
	$( '#board' ).mouseleave( updatedisplay );
	$( '#sun' ).click( function() {	switchselpiece( '#sun' ) } );
	$( '#sha' ).click( function() {	switchselpiece( '#sha' ) } );
	$( '#red' ).click( function() {	switchselpiece( '#red' ) } );
	$( '#blu' ).click( function() {	switchselpiece( '#blu' ) } );
	updatedisplay();
});
