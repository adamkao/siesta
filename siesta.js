var i, j, ctx, selpiece = '#sun',
	score = { red: 0, blu: 0 }, thismove = { red: 0, blu: 0 },
	edgelist = [], sunedgelist = [], shaedgelist = [],
	board = [
		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
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
		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
	];

function step( direction, cursor ) {
	if 		(direction == 'n') { cursor.y-- }
	else if (direction == 'e') { cursor.x++ }
 	else if (direction == 'w') { cursor.x-- }
 	else if (direction == 's') { cursor.y++ }	
}
function reverse( direction ) {
	if 		(direction == 'n') { return 's' }
	else if (direction == 'e') { return 'w' }
	else if (direction == 'w') { return 'e' }
	else if (direction == 's') { return 'n' }	
}

// step over any number of roofs, remembering what colors we hit
function skiproofs( direction, cursor, present ) {
	while ((board[cursor.x][cursor.y] == '#red') || (board[cursor.x][cursor.y] == '#blu')) {
		if 		(board[cursor.x][cursor.y] == '#red') { present.red = true }
		else if (board[cursor.x][cursor.y] == '#blu') { present.blu = true }
		step( direction, cursor );
	}
}
// count and score shadows adding points to the colors present
function addpointsfrom( pointct, direction, cursor, present, points ) {
	while (board[cursor.x][cursor.y] == '#sha') {
		pointct++;
		step( direction, cursor );
	}
	if (present.red) { points.red += pointct }
	if (present.blu) { points.blu += pointct }
}

function shafindsiesta( direction, xsq, ysq, points ) {
	var cursor = { x: xsq, y: ysq },
		present = { red: false, blu: false };
	step( direction, cursor );
	while (board[cursor.x][cursor.y] == '#sha') {
		step( direction, cursor );
	}
	if ((board[cursor.x][cursor.y] != '#red') && (board[cursor.x][cursor.y] != '#blu')) {
		return false
	}
	skiproofs( direction, cursor, present );
	if (board[cursor.x][cursor.y] == '#sun') {
		direction = reverse( direction );
		cursor = { x: xsq, y: ysq };
		step( direction, cursor );
		addpointsfrom( 1, direction, cursor, present, points );
		return true
	}
	return false
}
function findshapoints( xsq, ysq, points ) {
	shafindsiesta( 'n', xsq, ysq, points );
	shafindsiesta( 'e', xsq, ysq, points );
	shafindsiesta( 'w', xsq, ysq, points );
	shafindsiesta( 's', xsq, ysq, points );
}

function sunfindsiesta( direction, xsq, ysq, points ) {
	var cursor = { x: xsq, y: ysq },
		present = { red: false, blu: false };
	step( direction, cursor );
	skiproofs( direction, cursor, present );
	if (board[cursor.x][cursor.y] != '#sha') { return }
	addpointsfrom( 0, direction, cursor, present, points );
}
function findsunpoints( xsq, ysq, points ) {
	sunfindsiesta( 'n', xsq, ysq, points );
	sunfindsiesta( 'e', xsq, ysq, points );
	sunfindsiesta( 'w', xsq, ysq, points );
	sunfindsiesta( 's', xsq, ysq, points );
}

function rooffindsiesta( direction, xsq, ysq, present, points ) {
	var cursor = { x: xsq, y: ysq },
		tpres = present;
	step( direction, cursor );
	skiproofs( direction, cursor, tpres );
	if (board[cursor.x][cursor.y] != '#sun') { return }
	direction = reverse( direction );
	cursor = { x: xsq, y: ysq };
	step( direction, cursor );
	skiproofs( direction, cursor, tpres );
	if (board[cursor.x][cursor.y] != '#sha') { return }
	addpointsfrom( 0, direction, cursor, tpres, points );
}
function findroofpoints( xsq, ysq, points, present ) {
	rooffindsiesta( 'n', xsq, ysq, present, points );
	rooffindsiesta( 'e', xsq, ysq, present, points );
	rooffindsiesta( 'w', xsq, ysq, present, points );
	rooffindsiesta( 's', xsq, ysq, present, points );
}

function haspieceadjacent( xsq, ysq ) {
	return (((board[xsq-1][ysq] != 0) && (board[xsq-1][ysq] != -1))
		|| ((board[xsq+1][ysq] != 0) && (board[xsq+1][ysq] != -1))
		|| ((board[xsq][ysq-1] != 0) && (board[xsq][ysq-1] != -1))
		|| ((board[xsq][ysq+1] != 0) && (board[xsq][ysq+1] != -1)))
}
function hasnoadjacent( type, xsq, ysq ) {
	return ((board[xsq-1][ysq] != type)
		&& (board[xsq+1][ysq] != type)
		&& (board[xsq][ysq-1] != type)
		&& (board[xsq][ysq+1] != type))
}

function updateedgelists() {
	var xsq, ysq, points = { red: 0, blu: 0 };
	// all empty squares adjacent to pieces are on the edgelist
	edgelist = [];
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			if ((board[i][j] == 0) && haspieceadjacent( i, j )) {
				edgelist.push( [i, j] );
			}
		}
	}
	// all squares on the edgelist that are not adjacent to shadows are on the sunedgelist
	sunedgelist = [];
	for (i = 0; i < edgelist.length; i++) {
		xsq = edgelist[i][0], ysq = edgelist[i][1];
		if (hasnoadjacent( '#sha', xsq, ysq )) {
			sunedgelist.push( [xsq, ysq] );			
		}
	}
	// all squares on the edgelist that are not adjacent to suns and can be part of a siesta are on the shaedgelist
	shaedgelist = [];
	for (i = 0; i < edgelist.length; i++) {
		xsq = edgelist[i][0], ysq = edgelist[i][1];
		if (hasnoadjacent( '#sun', xsq, ysq )
			&& (shafindsiesta( 'n', xsq, ysq, points )
				|| shafindsiesta( 'e', xsq, ysq, points )
				|| shafindsiesta( 'w', xsq, ysq, points )
				|| shafindsiesta( 's', xsq, ysq, points ))) {
			shaedgelist.push( [xsq, ysq] );
		}
	}
}
function findonlist( list, xsq, ysq ) {
	if (list) {
		for (i = 0; i < list.length; i++) {
			if ((list[i][0] == xsq) && (list[i][1] == ysq)) {
				return true
			}
		}
	}
	return false
}

function imgdrawat( piece, xsq, ysq ) {
	ctx.drawImage( $( piece )[0], xsq*50 - 45 , ysq*50 - 45 );
}
function drawboard() {
	ctx.clearRect( 0, 0, 600, 600 );
	ctx.beginPath();
	for (var i=0; i<13; i++) {
		ctx.moveTo( i*50 + .5, .5 );
		ctx.lineTo( i*50 + .5, 600.5 );
		ctx.moveTo( .5, i*50 + .5 );
		ctx.lineTo( 600.5, i*50 + .5 );
	}
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;
	ctx.stroke();
}
function drawpieces() {
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			if (board[i][j] != 0) {
				imgdrawat( board[i][j], i, j );
			}
		}
	}
	if (selpiece == '#sun') {
		if (sunedgelist) {
			for (i = 0; i < sunedgelist.length; i++) {
				imgdrawat( '#tar', sunedgelist[i][0], sunedgelist[i][1] )
			}
		}
	} else if (selpiece == '#sha') {
		if (shaedgelist) {
			for (i = 0; i < shaedgelist.length; i++) {
				imgdrawat( '#tar', shaedgelist[i][0], shaedgelist[i][1] )
			}
		}
	} else if (edgelist) {
		for (i = 0; i < edgelist.length; i++) {
			imgdrawat( '#tar', edgelist[i][0], edgelist[i][1] )
		}
	}
}
function showscore() {
	$( '#output' ).val( 'this move red: ' + thismove.red + ', blue: ' + thismove.blu + '\n'
		+ 'total red: ' + score.red + ', blue: ' + score.blu );
}
function updatedisplay() {
	drawboard();
	drawpieces();
	showscore();
}
function switchselpiece( id ) {
	$( selpiece ).css( 'border', 'solid 3px white' );
	selpiece = id;
	$( selpiece ).css( 'border', 'solid 3px green' );
	updatedisplay();
}
function domove( xsq, ysq ) {
	board[xsq][ysq] = selpiece;
	score.red += thismove.red;
	score.blu += thismove.blu;
	updateedgelists();
	updatedisplay();
}

function mousemove( e ) {
	var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 ),
		ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );
	thismove = { red: 0, blu: 0 };
	if 		((selpiece == '#sun') && findonlist( sunedgelist, xsq, ysq )) { findsunpoints( xsq, ysq, thismove ) }
	else if ((selpiece == '#sha') && findonlist( shaedgelist, xsq, ysq )) { findshapoints( xsq, ysq, thismove ) }
	else {
		if 		((selpiece == '#red') && findonlist( edgelist, xsq, ysq )) {
			present = { red: true, blu: false };
		}				
		else if ((selpiece == '#blu') && findonlist( edgelist, xsq, ysq )) {
			present = { red: false, blu: true };
		}
		findroofpoints( xsq, ysq, thismove, present );
	}
	updatedisplay();
	imgdrawat( selpiece, xsq, ysq );
}
function click( e ) {
	var xsq = Math.ceil( (e.pageX - this.offsetLeft)/50 ),
		ysq = Math.ceil( (e.pageY - this.offsetTop)/50 );
	if (board[xsq][ysq] != 0) { return }
	if (((selpiece == '#sun') && findonlist( sunedgelist, xsq, ysq ))
		|| ((selpiece == '#sha') && findonlist( shaedgelist, xsq, ysq ))
		|| (((selpiece == '#red') || (selpiece == '#blu')) && (findonlist( edgelist, xsq, ysq )))) {
		domove( xsq, ysq );							
	}
}
function firstmousemove( e ) {
	drawboard();
	if (selpiece != '#sha') {
		for (i = 1; i <= 12; i++) {
			for (j = 1; j <= 12; j++) {
				imgdrawat( '#tar', i, j );
			}
		}
	}
	imgdrawat( selpiece,
		Math.ceil( (e.pageX - this.offsetLeft)/50 ),
		Math.ceil( (e.pageY - this.offsetTop)/50 ) );
}
function firstclick( e ) {
	if (selpiece == '#sha') { return }
	board
		[Math.ceil( (e.pageX - this.offsetLeft)/50 )]
		[Math.ceil( (e.pageY - this.offsetTop)/50 )]
		= selpiece;
	updateedgelists();
	$( '#board' ).off( 'mousemove' );
	$( '#board' ).mousemove( mousemove );
	$( '#board' ).off( 'click' );
	$( '#board' ).click( click );
}
$( document ).ready( function() {
	ctx = document.getElementById( 'board' ).getContext( '2d' );
	selpiece = '#sun';
	$( selpiece ).css( 'border', 'solid 3px green' );
	$( '#output' ).val( '' );
	$( '#board' ).mousemove( firstmousemove );
	$( '#board' ).click( firstclick );
	$( '#sun' ).click( function() {	switchselpiece( '#sun' ) } );
	$( '#sha' ).click( function() {	switchselpiece( '#sha' ) } );
	$( '#red' ).click( function() {	switchselpiece( '#red' ) } );
	$( '#blu' ).click( function() {	switchselpiece( '#blu' ) } );
	updatedisplay();
});
