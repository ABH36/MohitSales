<?php

date_default_timezone_set("Asia/Kolkata");
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $cname = $_POST['cname'] ?? '';
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $mobile = $_POST['mobile'] ?? '';
    $message = $_POST['message'] ?? '';
    $file = $_FILES['file'] ?? null;
    $date = date("l, F j, Y, g:i a");

    if (!empty($name) && !empty($cname) && !empty($message) && !empty($email) && !empty($mobile)) {
        try {
            $mail = new PHPMailer(true);
            $mail->SMTPDebug = 0;
            // $mail->isSMTP(); 
            $mail->Host = 'mail.bdminfotech.in';
            $mail->SMTPAuth = true;
            $mail->Username = 'donotreply@bdminfotech.in';
            $mail->Password = 'noreply@123';
            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            $mail->setFrom('donotreply@bdminfotech.in', 'Enquiry From Website - Mohit Sales Corporation Pvt. Ltd.');
            $mail->addAddress('support@bdminfotech.com', 'Enquiry From Website - Mohit Sales Corporation Pvt. Ltd.');
        //   $mail->addBCC('enquiry.bdminfotech@gmail.com');
       
            
if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'File not uploaded or upload error.']);
    exit;
}



            $mail->isHTML(true);
            $mail->Subject = 'Enquiry From Website - Mohit Sales Corporation Pvt. Ltd.';

            $message1 = '<html><body>';
            $message1 .= '<table rules="all" style="border-color: #ddd; border-width: 2px; border-style: solid;" cellpadding="10" width="60%">';
            $message1 .= '<tr style="background-color: #000; color: #fff;"><td colspan="2"><strong>Enquiry Details</strong></td></tr>';
            $message1 .= "<tr><td><strong>Contact Person</strong> </td><td> " . $name . " </td></tr>";
            $message1 .= "<tr><td><strong>Company Name </strong> </td><td> " . $cname . " </td></tr>";
            $message1 .= "<tr><td><strong>Email </strong> </td><td>" . $email . "</td></tr>";
            $message1 .= "<tr><td><strong>Contact No. </strong> </td><td> " . $mobile . " </td></tr>";
            $message1 .= "<tr><td><strong>Product Description </strong> </td><td> " . $message . " </td></tr>";
            $message1 .= "<tr><td><strong> Date & Time :</strong> </td><td>" . $date . "</td></tr>";
            $message1 .= "</table>";
            $message1 .= "</body></html>";

            $mail->Body = $message1;

       if ($mail->send()) {
    echo "success";
    exit;
} else {
    echo json_encode(['status' => 'error', 'message' => 'Mail sending failed.']);
    exit;
}

        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Mailer Error: ' . $mail->ErrorInfo]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Required fields are missing.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}

