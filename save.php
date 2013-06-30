<?php

// Get vars
$action = $_REQUEST['action'];
$file_name = trim(stripslashes($_REQUEST['file_name']));

// Reject file name if invalid
if(!preg_match('/^[A-Za-z0-9_\-\ ]{1,40}$/', $file_name)) return '0';

// Actions
if($action == 'check') {
	header('Content-Type: text/plain');
	echo (is_file('saved/' . $file_name)) ? '1' : '0';
	exit;
}

if($action == 'save') {
	echo (file_put_contents('saved/' . $file_name, base64_decode($_POST['data']))) ? '1' : '0';
}

?>
