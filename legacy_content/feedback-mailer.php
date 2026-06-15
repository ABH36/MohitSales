<?php
date_default_timezone_set("Asia/Kolkata");

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name             = $_POST['name'] ?? '';
    $email            = $_POST['email'] ?? '';
    $client_existance = $_POST['client_existance'] ?? '';
    $here_about       = $_POST['here_about'] ?? '';
    $rating           = $_POST['rating'] ?? '';
    $feedback_type    = $_POST['feedback_type'] ?? '';
    $feedback         = $_POST['feedback'] ?? '';
    $date             = date("l, F j, Y, g:i a");

    // Handle "Other" source case
    if ($here_about === 'Other' && isset($_POST['here_about'])) {
        $here_about = $_POST['here_about']; // Will be overwritten with otherField
        if (! empty($_POST['here_about'])) {
            $here_about = $_POST['here_about'];
        }
    }

    // Validation
    if (empty($name) || empty($email) || empty($here_about) || empty($feedback)) {
        echo "0";
        exit;
    }

    try {
        $mail = new PHPMailer(true);

        // Server Settings
        // $mail->isSMTP(); // Uncomment if you're using SMTP
        // $mail->Host       = 'mail.bdminfotech.co.in';
        // $mail->SMTPAuth   = true;
        // $mail->Username   = 'noreply@bdminfotech.co.in';
        // $mail->Password   = 'noreply@123';
        // $mail->SMTPSecure = 'tls';
        // $mail->Port       = 587;
        
                  $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'sales@prabhatwires.in';
        $mail->Password = 'amshkbflszconzsd'; 
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('sales@prabhatwires.in', 'Website Feedback');
        $mail->addAddress('sales@prabhatwires.in', 'Support Team');
        
          $mail->addBCC('enquiry.bdminfotech@gmail.com');

        // Email Content
        $mail->isHTML(true);
        $mail->Subject = "Feedback Form Submission - Mohit Sales Corporation Pvt. Ltd.";

        $mail->Body = "
            <html><body>
            <h2>Feedback Received</h2>
            <table cellpadding='10' border='1' style='border-collapse: collapse; font-family: Arial;'>
                <tr><td><strong>Name</strong></td><td>{$name}</td></tr>
                <tr><td><strong>Email</strong></td><td>{$email}</td></tr>
                <tr><td><strong>Existing Client?</strong></td><td>{$client_existance}</td></tr>
                <tr><td><strong>Heard About Us</strong></td><td>{$here_about}</td></tr>
                <tr><td><strong>Rating</strong></td><td>{$rating} Star(s)</td></tr>
                <tr><td><strong>Feedback Type</strong></td><td>{$feedback_type}</td></tr>
                <tr><td><strong>Comments</strong></td><td>{$feedback}</td></tr>
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