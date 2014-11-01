<?php

function create_board_table()
{
  $user = 'tester';
  $pass = 'test00';
  $DBH = new PDO('mysql:host=localhost;dbname=temptest', $user, $pass);
  $sql = 'CREATE TABLE board(
    game_number INT, move_number INT,
    player1piece1 CHAR(3), player1piece1x INT, player1piece1y INT,
    player1piece2 CHAR(3), player1piece2x INT, player1piece2y INT,
    player1piece3 CHAR(3), player1piece3x INT, player1piece3y INT,
    player2piece1 CHAR(3), player2piece1x INT, player2piece1y INT,
    player2piece2 CHAR(3), player2piece2x INT, player2piece2y INT,
    player2piece3 CHAR(3), player2piece3x INT, player2piece3y INT,
    player3piece1 CHAR(3), player3piece1x INT, player3piece1y INT,
    player3piece2 CHAR(3), player3piece2x INT, player3piece2y INT,
    player3piece3 CHAR(3), player3piece3x INT, player3piece3y INT,
    x0y0 CHAR(3), x1y0 CHAR(3), x2y0 CHAR(3), x3y0 CHAR(3), x4y0 CHAR(3), x5y0 CHAR(3), x6y0 CHAR(3),
    x7y0 CHAR(3), x8y0 CHAR(3), x9y0 CHAR(3), x10y0 CHAR(3), x11y0 CHAR(3), x12y0 CHAR(3), x13y0 CHAR(3),
    x0y1 CHAR(3), x1y1 CHAR(3), x2y1 CHAR(3), x3y1 CHAR(3), x4y1 CHAR(3), x5y1 CHAR(3), x6y1 CHAR(3),
    x7y1 CHAR(3), x8y1 CHAR(3), x9y1 CHAR(3), x10y1 CHAR(3), x11y1 CHAR(3), x12y1 CHAR(3), x13y1 CHAR(3),
    x0y2 CHAR(3), x1y2 CHAR(3), x2y2 CHAR(3), x3y2 CHAR(3), x4y2 CHAR(3), x5y2 CHAR(3), x6y2 CHAR(3),
    x7y2 CHAR(3), x8y2 CHAR(3), x9y2 CHAR(3), x10y2 CHAR(3), x11y2 CHAR(3), x12y2 CHAR(3), x13y2 CHAR(3),
    x0y3 CHAR(3), x1y3 CHAR(3), x2y3 CHAR(3), x3y3 CHAR(3), x4y3 CHAR(3), x5y3 CHAR(3), x6y3 CHAR(3),
    x7y3 CHAR(3), x8y3 CHAR(3), x9y3 CHAR(3), x10y3 CHAR(3), x11y3 CHAR(3), x12y3 CHAR(3), x13y3 CHAR(3),
    x0y4 CHAR(3), x1y4 CHAR(3), x2y4 CHAR(3), x3y4 CHAR(3), x4y4 CHAR(3), x5y4 CHAR(3), x6y4 CHAR(3),
    x7y4 CHAR(3), x8y4 CHAR(3), x9y4 CHAR(3), x10y4 CHAR(3), x11y4 CHAR(3), x12y4 CHAR(3), x13y4 CHAR(3),
    x0y5 CHAR(3), x1y5 CHAR(3), x2y5 CHAR(3), x3y5 CHAR(3), x4y5 CHAR(3), x5y5 CHAR(3), x6y5 CHAR(3),
    x7y5 CHAR(3), x8y5 CHAR(3), x9y5 CHAR(3), x10y5 CHAR(3), x11y5 CHAR(3), x12y5 CHAR(3), x13y5 CHAR(3),
    x0y6 CHAR(3), x1y6 CHAR(3), x2y6 CHAR(3), x3y6 CHAR(3), x4y6 CHAR(3), x5y6 CHAR(3), x6y6 CHAR(3),
    x7y6 CHAR(3), x8y6 CHAR(3), x9y6 CHAR(3), x10y6 CHAR(3), x11y6 CHAR(3), x12y6 CHAR(3), x13y6 CHAR(3),
    x0y7 CHAR(3), x1y7 CHAR(3), x2y7 CHAR(3), x3y7 CHAR(3), x4y7 CHAR(3), x5y7 CHAR(3), x6y7 CHAR(3),
    x7y7 CHAR(3), x8y7 CHAR(3), x9y7 CHAR(3), x10y7 CHAR(3), x11y7 CHAR(3), x12y7 CHAR(3), x13y7 CHAR(3),
    x0y8 CHAR(3), x1y8 CHAR(3), x2y8 CHAR(3), x3y8 CHAR(3), x4y8 CHAR(3), x5y8 CHAR(3), x6y8 CHAR(3),
    x7y8 CHAR(3), x8y8 CHAR(3), x9y8 CHAR(3), x10y8 CHAR(3), x11y8 CHAR(3), x12y8 CHAR(3), x13y8 CHAR(3),
    x0y9 CHAR(3), x1y9 CHAR(3), x2y9 CHAR(3), x3y9 CHAR(3), x4y9 CHAR(3), x5y9 CHAR(3), x6y9 CHAR(3),
    x7y9 CHAR(3), x8y9 CHAR(3), x9y9 CHAR(3), x10y9 CHAR(3), x11y9 CHAR(3), x12y9 CHAR(3), x13y9 CHAR(3),
    x0y10 CHAR(3), x1y10 CHAR(3), x2y10 CHAR(3), x3y10 CHAR(3), x4y10 CHAR(3), x5y10 CHAR(3), x6y10 CHAR(3),
    x7y10 CHAR(3), x8y10 CHAR(3), x9y10 CHAR(3), x10y10 CHAR(3), x11y10 CHAR(3), x12y10 CHAR(3), x13y10 CHAR(3),
    x0y11 CHAR(3), x1y11 CHAR(3), x2y11 CHAR(3), x3y11 CHAR(3), x4y11 CHAR(3), x5y11 CHAR(3), x6y11 CHAR(3),
    x7y11 CHAR(3), x8y11 CHAR(3), x9y11 CHAR(3), x10y11 CHAR(3), x11y11 CHAR(3), x12y11 CHAR(3), x13y11 CHAR(3),
    x0y12 CHAR(3), x1y12 CHAR(3), x2y12 CHAR(3), x3y12 CHAR(3), x4y12 CHAR(3), x5y12 CHAR(3), x6y12 CHAR(3),
    x7y12 CHAR(3), x8y12 CHAR(3), x9y12 CHAR(3), x10y12 CHAR(3), x11y12 CHAR(3), x12y12 CHAR(3), x13y12 CHAR(3),
    x0y13 CHAR(3), x1y13 CHAR(3), x2y13 CHAR(3), x3y13 CHAR(3), x4y13 CHAR(3), x5y13 CHAR(3), x6y13 CHAR(3),
    x7y13 CHAR(3), x8y13 CHAR(3), x9y13 CHAR(3), x10y13 CHAR(3), x11y13 CHAR(3), x12y13 CHAR(3), x13y13 CHAR(3)
    )';
  $DBH->exec($sql);
  $sq = $DBH->query($sql);
}

$value = 'An error has occurred';

if (isset($_GET['action']) and $_GET['action'] == 'createtable')
{
  $value = create_board_table();
  exit(json_encode($value));
}
if (isset($_GET['action']) and $_GET['action'] == 'getboard')
{
  $gameid =  (isset($_GET['gameid'])) ? $_GET['gameid'] : 0;
  $moveid =  (isset($_GET['moveid'])) ? $_GET['moveid'] : 0;
  if ($gameid and $moveid)
  {
    $value = get_board($gameid, $moveid);
  }
  exit(json_encode($value));
}
  if(isset($_POST) and $_SERVER['REQUEST_METHOD'] == 'POST'){
    echo($_POST['move']['piece2type']);
    echo($_POST['board'][1][2]);
    echo($_POST['move']['piece1type']);
    exit;
  }
  exit(json_encode($value));
?>
