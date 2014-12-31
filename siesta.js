var i, j, ctx, isfirstmove = true, selpiece = 'sun', oldimg,
	redpts = 0, blupts = 0,
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
// step over any number of roofs, remembering what colors we hit
function skiproofs( direction, cursor, present ) {
	while ((board[cursor.x][cursor.y] == 'red') || (board[cursor.x][cursor.y] == 'blu')) {
		if 		(board[cursor.x][cursor.y] == 'red') { present.red = true }
		else if (board[cursor.x][cursor.y] == 'blu') { present.blu = true }
		step( direction, cursor );
	}
}
function addpointsfrom( pointct, direction, cursor, present, points ) {
	while (board[cursor.x][cursor.y] == 'sha') {
		pointct++;
		step( direction, cursor );
	}
	if (present.red) { points.red += pointct }
	if (present.blu) { points.blu += pointct }
}

function shafindsiesta( direction, xsq, ysq, present ) {
	var cursor = { x:xsq, y: ysq };
	present.red = present.blu = false;

	step( direction, cursor );
	while (board[cursor.x][cursor.y] == 'sha') {
		step( direction, cursor );
	}
	if ((board[cursor.x][cursor.y] != 'red') && (board[cursor.x][cursor.y] != 'blu')) {
		return false
	}
	skiproofs( direction, cursor, present );
	if (board[cursor.x][cursor.y] == 'sun') {
		return true
	}
	return false
}

function findshapoints( xsq, ysq, points ) {
	var present = { red: false, blu: false},
		cursor = { x: xsq, y: ysq };
	points.red = points.blu = 0;

	if (shafindsiesta( 'n', xsq, ysq, present )) {
		cursor.x = xsq, cursor.y = ysq;
		step( 's', cursor );
		addpointsfrom( 1, 's', cursor, present, points );
	}
	if (shafindsiesta( 'e', xsq, ysq, present )) {
		cursor.x = xsq, cursor.y = ysq;
		step( 'w', cursor );
		addpointsfrom( 1, 'w', cursor, present, points );
	}
	if (shafindsiesta( 'w', xsq, ysq, present )) {
		cursor.x = xsq, cursor.y = ysq;
		step( 'e', cursor );
		addpointsfrom( 1, 'e', cursor, present, points );
	}
	if (shafindsiesta( 's', xsq, ysq, present )) {
		cursor.x = xsq, cursor.y = ysq;
		step( 'n', cursor );
		addpointsfrom( 1, 'n', cursor, present, points );
	}
	return
}

function sunfindsiesta( direction, xsq, ysq, present, points ) {
	var cursor = new Object;
	cursor.x = xsq, cursor.y = ysq;
	present.red = present.blu = false;

	step( direction, cursor );
	skiproofs( direction, cursor, present );
	if (board[cursor.x][cursor.y] != 'sha') { return }
	addpointsfrom( 0, direction, cursor, present, points );
	return
}
function findsunpoints( xsq, ysq, points ) {
	var present = new Object();
	points.red = points.blu = 0;

	sunfindsiesta( 'n', xsq, ysq, present, points );
	sunfindsiesta( 'e', xsq, ysq, present, points );
	sunfindsiesta( 'w', xsq, ysq, present, points );
	sunfindsiesta( 's', xsq, ysq, present, points );
}

function rooffindsiesta( direction, xsq, ysq, present, points ) {
	var cursor = new Object, pointct = 0;

	cursor.x = xsq, cursor.y = ysq;
	step( direction, cursor );
	skiproofs( direction, cursor, present );
	if (board[cursor.x][cursor.y] != 'sun') { return }
	if 		(direction == 'n') { direction = 's' }
	else if (direction == 'e') { direction = 'w' }
	else if (direction == 'w') { direction = 'e' }
	else if (direction == 's') { direction = 'n' }
	cursor.x = xsq, cursor.y = ysq;
	step( direction, cursor );
	skiproofs( direction, cursor, present );
	if (board[cursor.x][cursor.y] != 'sha') { return }
	addpointsfrom( 0, direction, cursor, present, points );
	return
}
function findroofpoints( xsq, ysq, points, present ) {
	var tpres = new Object();

	tpres.red = present.red, tpres.blu = present.blu;
	rooffindsiesta( 'n', xsq, ysq, tpres, points );
	tpres.red = present.red, tpres.blu = present.blu;
	rooffindsiesta( 'e', xsq, ysq, tpres, points );
	tpres.red = present.red, tpres.blu = present.blu;
	rooffindsiesta( 'w', xsq, ysq, tpres, points );
	tpres.red = present.red, tpres.blu = present.blu;
	rooffindsiesta( 's', xsq, ysq, tpres, points );
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
	var xsq, ysq, present = new Object();

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
		if (hasnoadjacent( 'sha', xsq, ysq )) {
			sunedgelist.push( [xsq, ysq] );			
		}
	}
	// all squares on the edgelist that are not adjacent to suns and can be part of a siesta are on the shaedgelist
	shaedgelist = [];
	for (i = 0; i < edgelist.length; i++) {
		xsq = edgelist[i][0], ysq = edgelist[i][1];
		if (hasnoadjacent( 'sun', xsq, ysq )
			&& (shafindsiesta( 'n', xsq, ysq, present )
				|| shafindsiesta( 'e', xsq, ysq, present )
				|| shafindsiesta( 'w', xsq, ysq, present )
				|| shafindsiesta( 's', xsq, ysq, present ))) {
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
	ctx.drawImage( document.getElementById( piece ), xsq*50 - 45 , ysq*50 - 45 );
}
function drawfirstmove() {
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			imgdrawat( 'tar', i, j );
		}
	}
}
function initfirstmove( xsq, ysq ) {
	if (selpiece == 'sha') { return }
	board[xsq][ysq] = selpiece;
	updateedgelists();
	isfirstmove = false;
}
function drawpieces() {
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			if (board[i][j] != 0) {
				imgdrawat( board[i][j], i, j );
			}
		}
	}
	if (selpiece == 'sun') {
		if (sunedgelist) {
			for (i = 0; i < sunedgelist.length; i++) {
				imgdrawat( 'tar', sunedgelist[i][0], sunedgelist[i][1] )
			}
		}
	} else if (selpiece == 'sha') {
		if (shaedgelist) {
			for (i = 0; i < shaedgelist.length; i++) {
				imgdrawat( 'tar', shaedgelist[i][0], shaedgelist[i][1] )
			}
		}
	} else if (edgelist) {
		for (i = 0; i < edgelist.length; i++) {
			imgdrawat( 'tar', edgelist[i][0], edgelist[i][1] )
		}
	}
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
function updatedisplay() {
	drawboard();
	if (isfirstmove && (selpiece != 'sha')) { drawfirstmove(); }
	else { drawpieces(); }
}
function switchselpiece( newpiece, id ) {
	selpiece = newpiece;
	oldimg.css( 'border', 'solid 3px white' );
	$( id ).css( 'border', 'solid 3px green' );
	oldimg = $( id );
	updatedisplay();
}
function showscore( points ) {
	$( '#output' ).val( 'this move red: ' + points.red + ', blue: ' + points.blu + '\n'
		+ 'total red: ' + redpts + ', blue: ' + blupts );
}
function domove( xsq, ysq, points ) {
	board[xsq][ysq] = selpiece;
	redpts += points.red, blupts += points.blu;
	updateedgelists();
	drawboard();
	drawpieces();
	showscore( points );
}

$( document ).ready( function() {
	var x = 0, y = 0, xsq = 0, ysq = 0,
		points = new Object(), present = new Object();
	ctx = document.getElementById( 'board' ).getContext( '2d' );
	updatedisplay();
	$( '#sun' ).css( 'border', 'solid 3px green' );
	oldimg = $( '#sun' );
	$( '#output' ).val( '' );

	$( '#board' ).mousemove( function( e ) {
		x = e.pageX - this.offsetLeft,	y = e.pageY - this.offsetTop;
		xsq = Math.ceil( x/50 ),		ysq = Math.ceil( y/50 );
		updatedisplay();
		imgdrawat( selpiece, xsq, ysq );
		if (isfirstmove) {
			return
		}
		points.red = points.blu = 0;
		if 		((selpiece == 'sun') && findonlist( sunedgelist, xsq, ysq )) { findsunpoints( xsq, ysq, points ) }
		else if ((selpiece == 'sha') && findonlist( shaedgelist, xsq, ysq )) { findshapoints( xsq, ysq, points ) }
		else {
			if 		((selpiece == 'red') && findonlist( edgelist, xsq, ysq )) {
				present.red = true, present.blu = false;
				findroofpoints( xsq, ysq, points, present );
			}				
			else if ((selpiece == 'blu') && findonlist( edgelist, xsq, ysq )) {
				present.red = false, present.blu = true;
				findroofpoints( xsq, ysq, points, present );
			}
		}
		showscore( points );
	});
	$( '#board' ).click( function( e ) {
		x = e.pageX - this.offsetLeft,	y = e.pageY - this.offsetTop;
		xsq = Math.ceil( x/50 ),		ysq = Math.ceil( y/50 );
		if (board[xsq][ysq] != 0) { return }
		if (isfirstmove) {
			initfirstmove( xsq, ysq );
			return
		}
		if (((selpiece == 'sun') && findonlist( sunedgelist, xsq, ysq ))
			|| ((selpiece == 'sha') && findonlist( shaedgelist, xsq, ysq ))
			|| (((selpiece == 'red') || (selpiece == 'blu')) && (findonlist( edgelist, xsq, ysq )))) {
			domove( xsq, ysq, points );							
		}
	});
	$( '#sun' ).click( function() {	switchselpiece( 'sun', this ) });
	$( '#sha' ).click( function() {	switchselpiece( 'sha', this ) });
	$( '#red' ).click( function() {	switchselpiece( 'red', this ) });
	$( '#blu' ).click( function() {	switchselpiece( 'blu', this ) });
});
