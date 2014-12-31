var ctx, isfirstmove = true, selpiece = 'sun', oldimg,
	redscore = 0, bluscore = 0, redpts = 0, blupts = 0,
	edgelist = [], shaedgelist = [], sunedgelist = [],
	hist = new Array(),
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
	],
	move = {
		piece1type 	: 'sun',
		piece1x 	: 0,
		piece1y 	: 0,
		piece2type 	: 'red',
		piece2x 	: 0,
		piece2y 	: 1,
		piece3type 	: 'sha',
		piece3x 	: 0,
		piece3y 	: 2,
	}
hist.push( board );


function show( s ) { document.getElementById( 'output' ).value = s }


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
// count shadows in direction 
function countsha( direction, cursor ) {
	var count = 0;
	while (board[cursor.x][cursor.y] == 'sha') {
		count++;
		step( direction, cursor );
	}
	return count
}


function shafindsiesta( direction, xsq, ysq, present ) {
	var cursor = new Object;
	cursor.x = xsq, cursor.y = ysq;
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
	var present = new Object(), cursor = new Object(), pointct = 0;
	points.red = points.blu = 0;
	present.red = present.blu = false;

	if (shafindsiesta( 'n', xsq, ysq, present )) {
		pointct = 1;
		cursor.x = xsq, cursor.y = ysq;
		step( 's', cursor );
		pointct += countsha( 's', cursor );
		if (present.red) { points.red += pointct }
		if (present.blu) { points.blu += pointct }
	}
	if (shafindsiesta( 'e', xsq, ysq, present )) {
		pointct = 1;
		cursor.x = xsq, cursor.y = ysq;
		step( 'w', cursor );
		pointct += countsha( 'w', cursor );
		if (present.red) { points.red += pointct }
		if (present.blu) { points.blu += pointct }
	}
	if (shafindsiesta( 'w', xsq, ysq, present )) {
		pointct = 1;
		cursor.x = xsq, cursor.y = ysq;
		step( 'e', cursor );
		pointct += countsha( 'e', cursor )
		if (present.red) { points.red += pointct }
		if (present.blu) { points.blu += pointct }
	}
	if (shafindsiesta( 's', xsq, ysq, present )) {
		pointct = 1;
		cursor.x = xsq, cursor.y = ysq;
		step( 'n', cursor );
		pointct += countsha( 'n', cursor )
		if (present.red) { points.red += pointct }
		if (present.blu) { points.blu += pointct }
	}
	return
}

function sunfindsiesta( direction, xsq, ysq, present, points ) {
	var cursor = new Object, pointct = 0;
	cursor.x = xsq, cursor.y = ysq;
	present.red = present.blu = false;

	step( direction, cursor );
	skiproofs( direction, cursor, present );
	if (board[cursor.x][cursor.y] != 'sha') { return }
	pointct += countsha( direction, cursor );
	if (present.red) { points.red += pointct }
	if (present.blu) { points.blu += pointct }
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
	pointct += countsha( direction, cursor );
	if (present.red) { points.red += pointct }
	if (present.blu) { points.blu += pointct }
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
		|| ((board[xsq][ysq+1] != 0) && (board[xsq][ysq+1] != -1)));
}
function hasnoadjacent( type, xsq, ysq ) {
	return ((board[xsq-1][ysq] != type)
		&& (board[xsq+1][ysq] != type)
		&& (board[xsq][ysq-1] != type)
		&& (board[xsq][ysq+1] != type));
}

function updateedgelists() {
	var i, j, xsq, ysq, present = new Object();

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

function imgdrawat( piece, xsq, ysq ) {
	ctx.drawImage( document.getElementById( piece ), xsq*50 - 45 , ysq*50 - 45 );
}
function drawpieces() {
	var i, j;

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


function drawfirstmove() {
	var i, j;
	for (i = 1; i <= 12; i++) {
		for (j = 1; j <= 12; j++) {
			imgdrawat( 'tar', i, j );
		}
	}
}

function updatedisplay() {
	drawboard();
	if (isfirstmove && (selpiece != 'sha')) { drawfirstmove(); }
	else { drawpieces(); }
}
function initedgelist( elist, xsq, ysq ) {
	if (xsq != 1) { elist.push( [xsq-1, ysq] ) }
	if (ysq != 1) { elist.push( [xsq, ysq-1] ) }
	if (xsq != 12) { elist.push( [xsq+1, ysq] ) }
	if (ysq != 12) { elist.push( [xsq, ysq+1] ) }
}
function initfirstmove( xsq, ysq ) {
	if (selpiece == 'sha') { return }
	board[xsq][ysq] = selpiece;
	edgelist = sunedgelist = shaedgelist = [];
	initedgelist( edgelist, xsq, ysq );
	initedgelist( sunedgelist, xsq, ysq );
	if (selpiece != 'sun') { initedgelist( shaedgelist, xsq, ysq ) }
	isfirstmove = false;
}

function domove( board, xsq, ysq, points ) {
	board[xsq][ysq] = selpiece;
	redpts += points.red, blupts += points.blu;
	updateedgelists();
}

$( document ).ready( function() {
	var i, x = 0, y = 0, xsq = 0, ysq = 0,
		points = new Object(), present = new Object();
	ctx = document.getElementById( 'board' ).getContext( '2d' );

	updatedisplay();

	$( '#sun' ).css( 'border', 'solid 3px green' );
	oldimg = $( '#sun' );

	$( '#done' ).prop( 'disabled', false );
	$( '#undo' ).prop( 'disabled', true );

	$( '#board' ).mousemove( function( e ) {
		x = e.pageX - this.offsetLeft,	y = e.pageY - this.offsetTop;
		xsq = Math.ceil( x/50 ),		ysq = Math.ceil( y/50 );

		updatedisplay();
		if (board[xsq][ysq] == 0) {
			imgdrawat( selpiece, xsq, ysq );
			points.red = points.blu = 0;
			if 		(selpiece == 'sun') { findsunpoints( xsq, ysq, points ) }
			else if (selpiece == 'sha') { findshapoints( xsq, ysq, points ) }
			else {
				if 		(selpiece == 'red') { present.red = true, present.blu = false }
				else if (selpiece == 'blu') { present.red = false, present.blu = true }
				findroofpoints( xsq, ysq, points, present );
			}
		}
//		show( 'red: ' + points.red + ', blue: ' + points.blu );
	});

	$( '#board' ).click( function( e ) {
		x = e.pageX - this.offsetLeft,	y = e.pageY - this.offsetTop;
		xsq = Math.ceil( x/50 ),		ysq = Math.ceil( y/50 );

		if (board[xsq][ysq] != 0) { return }

		hist.push( board );
		board = $.extend( true, [], board );
		$( '#undo' ).prop( 'disabled', false );

		if (isfirstmove == true) {
			initfirstmove( xsq, ysq );
			return
		}

		if (selpiece == 'sun') {
			for (i=0; i<sunedgelist.length; i++) {
				if ((sunedgelist[i][0] == xsq) && (sunedgelist[i][1] == ysq)) {
					points.red = points.blu = 0;
					findsunpoints( xsq, ysq, points );
					domove( board, xsq, ysq, points );
					drawboard();
					drawpieces();
					break;
				}
			}
		} else if (selpiece == 'sha') {
			for (i=0; i<shaedgelist.length; i++) {
				if ((shaedgelist[i][0] == xsq) && (shaedgelist[i][1] == ysq)) {
					points.red = points.blu = 0;
					findshapoints( xsq, ysq, points );
					domove( board, xsq, ysq, points );
					drawboard();
					drawpieces();
					break;
				}
			}
		} else {
			for (i=0; i<edgelist.length; i++) {
				if ((edgelist[i][0] == xsq) && (edgelist[i][1] == ysq)) {
					domove( board, xsq, ysq, points );
					drawboard();
					drawpieces();
					break;
				}
			}
		}
	});

	$( '#sun' ).click( function() {
		selpiece = 'sun';
		oldimg.css( 'border', 'solid 3px white' );
		$( this ).css( 'border', 'solid 3px green' );
		oldimg = $( this );
		updatedisplay();
	});
	$( '#sha' ).click( function() {
		selpiece = 'sha';
		oldimg.css( 'border', 'solid 3px white' );
		$( this ).css( 'border', 'solid 3px green' );
		oldimg = $( this );
		updatedisplay();
	});
	$( '#red' ).click( function() {
		selpiece = 'red';
		oldimg.css( 'border', 'solid 3px white' );
		$( this ).css( 'border', 'solid 3px green' );
		oldimg = $( this );
		updatedisplay();
	});
	$( '#blu' ).click( function() {
		selpiece = 'blu';
		oldimg.css( 'border', 'solid 3px white' );
		$( this ).css( 'border', 'solid 3px green' );
		oldimg = $( this );
		updatedisplay();
	});
	$( '#undo' ).click( function( e ) {
		board = history.pop();
		updateedgelists( xsq, ysq );
		if (history.length == 1) {
			isfirstmove = true;			
			$( '#undo' ).prop( 'disabled', true );
		}
		updatedisplay();
	});
	$( '#done' ).click( function( e ) {
		$.post('api.php', { game_number: '1', move_number: '1', board: board, move: move }, function(data){
	        $('#output').html(data);
	    }).fail(function() {
	        alert( "Posting failed." );
	    });
	});
});
