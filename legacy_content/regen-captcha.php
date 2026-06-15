<?php
session_start();
$_SESSION['captcha'] = strval(rand(1000, 9999));
header('Content-Type: text/plain');
echo $_SESSION['captcha'];