<?php
session_start();
date_default_timezone_set("Asia/Kolkata");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'] ?? '';
    $cname = $_POST['cname'] ?? '';
    $email = $_POST['email'] ?? '';
    $mobile = $_POST['mobile'] ?? '';
    $message = $_POST['message'] ?? '';
    $userCaptcha = $_POST['captcha_input'] ?? '';
    $date = date("l, F j, Y, g:i a");

    if (empty($name) || empty($cname) || empty($email) || empty($mobile) || empty($message)) {
        echo "error: missing fields";
        exit;
    }
    
      if ($userCaptcha !== ($_SESSION['captcha'] ?? '')) {
        echo "captchafail";
        exit;
    }

    try {
        $mail = new PHPMailer(true);
        // $mail->isSMTP();
        // $mail->Host = 'mail.bdminfotech.co.in';
        // $mail->SMTPAuth = true;
        // $mail->Username = 'noreply@bdminfotech.co.in';
        // $mail->Password = 'noreply@123';
        // $mail->SMTPSecure = 'tls';
        // $mail->Port = 587;
    
        
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username   = 'karan.wadhwani@mohitscpl.com';
        $mail->Password   = 'ciqfzdikvmlxwtof';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom('karan.wadhwani@mohitscpl.com', 'Enquiry From Website - Mohit Sales Corporation Pvt. Ltd.');
        // $mail->setFrom('info@mohitscpl.com', 'Enquiry From Website - Mohit Sales Corporation Pvt. Ltd.');
        $mail->addAddress('info@mohitscpl.com', 'Enquiry From Website - Mohit Sales Corporation Pvt. Ltd.');
        //  $mail->addAddress('support@bdminfotech.com', 'Support Team');
        
          $mail->addBCC('enquiry.bdminfotech@gmail.com');
        
        // $mail->setFrom('noreply@bdminfotech.co.in', 'Website Enquiry');

        // Attach file if uploaded
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $mail->addAttachment($_FILES['file']['tmp_name'], $_FILES['file']['name']);
        }

        $mail->isHTML(true);
        $mail->Subject = 'Enquiry From Website - Mohit Sales Corporation Pvt. Ltd.';
        $mail->Body = "
            <html><body>
            <table cellpadding='10' border='1' style='border-collapse: collapse;'>
                <tr><td><strong>Name</strong></td><td>{$name}</td></tr>
                <tr><td><strong>Company</strong></td><td>{$cname}</td></tr>
                <tr><td><strong>Email</strong></td><td>{$email}</td></tr>
                <tr><td><strong>Phone</strong></td><td>{$mobile}</td></tr>
                <tr><td><strong>Message</strong></td><td>{$message}</td></tr>
                <tr><td><strong>Date</strong></td><td>{$date}</td></tr>
            </table>
            </body></html>
        ";

        if ($mail->send()) {
            echo "success";
        } else {
            echo "error: mail send failed";
        }

    } catch (Exception $e) {
        echo "error: " . $mail->ErrorInfo;
    }
} else {
    echo "error: invalid request";
}
