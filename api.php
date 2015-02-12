<?php

function create_game( $DBH )
{
  $dbuser = 'test00';
  $pass = 'test00';
  $DBH = new PDO( 'mysql:host=localhost;dbname=test', $dbuser, $pass );

  $stmt = $DBH->prepare( 'INSERT INTO siesta '
    . '( $id1 ) '
    . 'VALUES ( ?);' );
  if (!$stmt->execute( array( $id1 ) ))
  {
    exit ('INSERT game failed');
  }
  exit (json_encode( array() ));
}

function get_game( $DBH, $gameid )
{
  return 'getgame ' . $gameid;
}

if (isset($_GET['action']) and $_GET['action'] == 'login')
{
  $username = (isset($_GET['user'])) ? $_GET['user'] : 0;

  $dbuser = 'test00';
  $pass = 'test00';
  $DBH = new PDO('mysql:host=localhost;dbname=test', $dbuser, $pass);

  $stmt = $DBH->prepare( 'SELECT PID FROM users WHERE username = (?);' );
  if (!$stmt->execute( array( $username ) ))
  {
    exit ('SELECT from users failed');
  }
  $rows = $stmt->fetchAll();
  if ($rows) exit ($rows[0][0]);
  else exit ('not found');
}

if (isset($_GET['action']) and $_GET['action'] == 'creategame')
{
  $player1 = (isset($_GET['pid1'])) ? $_GET['pid1'] : 1;

  $dbuser = 'test00';
  $pass = 'test00';
  $DBH = new PDO('mysql:host=localhost;dbname=test', $dbuser, $pass);
  create_game( $DBH, $player1, $player2, $player3 );
}

if (isset($_GET['action']) and $_GET['action'] == 'getgame')
{
  $gameid = (isset($_GET['gameid'])) ? $_GET['gameid'] : 0;

  $dbuser = 'test00';
  $pass = 'test00';
  $DBH = new PDO('mysql:host=localhost;dbname=test', $dbuser, $pass);

  $stmt = $DBH->prepare( 'SELECT * FROM siesta WHERE id = (?);' );
  if (!$stmt->execute( array( $gameid ) )) {
    exit ('SELECT from siesta failed');
  }
  $rows = $stmt->fetchAll();
  exit (json_encode( $rows[0] ));
}

if (isset($_POST['action']) and $_POST['action'] == 'makemove')
{
  $gameid = (isset($_POST['gameid'])) ? $_POST['gameid'] : 0;
  $move = (isset($_POST['move'])) ? $_POST['move'] : 0;

  exit (json_encode( array() ));
}
