<?php include 'config.php'; ?>

<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    
        <?php include ROOT_PATH . '/common/links.php'; ?>

    <!-- Favicon

================================================== -->

    <link rel="icon" type="image/png" href="images/favicon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=Asap:ital,wght@0,100..900;1,100..900&family=Readex+Pro:wght@160..700&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />


    <link href="
https://cdn.jsdelivr.net/npm/sweetalert2@11.15.10/dist/sweetalert2.min.css
" rel="stylesheet">

    <title>Feedback Form</title>

    <style>
    body {

        /*background: linear-gradient(45deg, rgba(74,194,242,1) 0%, rgba(85,225,225,1) 100%);*/

        background-color: #d2e5fc;

        font-family: "Asap", sans-serif;

    }

    .feedback-form {
        max-width: 600px;
        margin: 50px auto;
        background-color: #fff;
        position: relative;
        padding: 30px 50px;
        border-radius: 8px;
    }

    /*.feedback-form::after{*/

    /*  position:absolute;*/

    /*  content:'';*/

    /*  width:30px;*/

    /*  height:100%;*/

    /*  top:0px;*/

    /*  right:0px;*/

    /*  background-color:#4285f4;*/

    /*  border-radius:0px 8px 8px 0px;*/

    /*  right: -30px;*/

    /*}*/

    .input-group {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
    }



    .feedback-form h1 {
        margin: 0px;
        margin-bottom: 10px;
        font-family: "Asap", sans-serif;
        text-align: center;
    }

    .feedback-form h3 {
        margin-bottom: 40px;
        margin-top: 0px;
        font-weight: 400;
        font-size: 18px;
        font-family: "Asap", sans-serif;
        text-align: center;
    }

    label {
        margin-bottom: 10px;
        font-size: 18px;
        font-family: "Readex Pro", sans-serif;
    }

    input,
    select,
    textarea {
        /*background-color:#e6e6e6;*/
        border: unset;
        border-radius: 4px;
        background-color: transparent;
        padding: 14px 10px;
        font-size: 16px;
        font-family: "Readex Pro", sans-serif;
        font-weight: 300;
        /*border-radius:unset;*/
        /*border:1px solid #282828;*/
    }

    input:focus,
    select:focus,
    textarea:focus {
        outline: unset;
        border: unset;
    }

    .submit-btn {
        background-color: #28166f;
        color: #ffffff;
        font-weight: 500;
        padding: 14px 0px;
        width: 100%;
        font-size: 18px;
        border: unset;
        border-radius: 4px;
        cursor: pointer;
    }

    .logo {
        width: 400px;
        margin: auto;
    }

    .polycab_logo {
        width: 180px;
    }

    img {
        max-width: 100%;
        height: 100%;
    }

    .logo_row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .top_line {
        font-size: 22px;
        width: 65%;
        font-family: "Readex Pro", sans-serif;
        font-style: italic
    }

    .mb20 {
        margin-bottom: 20px;
    }

    .mb50 {
        margin-bottom: 50px;
    }

    hr {
        height: 2px;
        background-color: #000000;
        border-radius: 100%;
        margin: 15px 0px 35px 0px;
        filter: blur(1px);
        opacity: 0.4;
    }

    .input-group label span {

        color: red;

    }

    #otherField {

        display: none;

    }





    /*Rating*/

    .rating {

        direction: rtl;

        unicode-bidi: bidi-override;

        font-size: 2rem;

        display: flex;

        justify-content: end;

        align-items: center;

    }

    .rating>input {

        display: none;

    }

    .rating>label {

        display: inline-block;

        position: relative;

        width: 40px;

        font-size: 40px;

        cursor: pointer;

        color: #ddd;

        transition: color 0.2s ease-in-out;

    }

    .rating>label:hover,

    .rating>label:hover~label,

    .rating>input:checked~label {

        color: gold;

    }
    </style>

</head>

<body>

    <div class="feedback-form">


        <div class="logo mb20">

            <img src="<?php echo BASE_URL . 'assets/images/logo/prabhat-logo-with-bg.png'; ?>"
                class="prbhat wires logo" />

        </div>

        <div class="logo_row">

            <p class="top_line">Authorised Distributors of <br>Wires & Cables</p>

            <div class="polycab_logo">

                <img src="<?php echo BASE_URL . 'assets/images/logo/polycab-logo.png'; ?>" class="polycab-logo" />

            </div>

        </div>

        <hr />

        <h1>FEEDBACK FORM</h1>

        <h3>Your opinion matters to us. Let us know how we’re doing and what we can do better.</h3>

        <form id="feedback-form" method="post">

            <div class="input-group">

                <label for="name">Name <span>*</span></label>

                <input type="text" id="name" name="name" placeholder="CONTACT PERSON / ORGANISATION NAME

" style="background-color:#e8e9ff;" required>

            </div>



            <div class="input-group">

                <label for="email">Email <span>*</span></label>

                <input type="email" id="email" name="email" style="background-color:#dde1ff;" required>

            </div>

            <div class="input-group">

                <label for="client_existance">Are you an existing client?</label>

                <select name="client_existance" id="client_existance" style="background-color:#c7cdfd;">

                    <option value="">Select</option>

                    <option value="Yes">Yes</option>

                    <option value="No">No</option>

                </select>

            </div>



            <div class="input-group">

                <label for="here_about">How did you hear about us? <span>*</span></label>

                <select name="here_about" id="here_about" style="background-color:#c7cdfd;" required>

                    <option value="">Select</option>

                    <option value="Social Media">Social Media</option>

                    <option value="Web Search">Web Search</option>

                    <option value="Friend/Family">Friend/Family</option>

                    <option value="Advertisement">Advertisement</option>

                    <option value="Other">Other</option>

                </select>



                <input type="text" name="here_about" style="background-color:#dde1ff;width:100%;" id="otherField"
                    class="mt-4" placeholder="Please Specify Here..." disabled>



            </div>



            <div class="input-group">

                <label for="rating">Rate Us</label>

                <div class="rating">

                    <input type="radio" id="star5" name="rating" value="5" /><label for="star5"
                        title="5 stars">&#9733;</label>

                    <input type="radio" id="star4" name="rating" value="4" /><label for="star4"
                        title="4 stars">&#9733;</label>

                    <input type="radio" id="star3" name="rating" value="3" /><label for="star3"
                        title="3 stars">&#9733;</label>

                    <input type="radio" id="star2" name="rating" value="2" /><label for="star2"
                        title="2 stars">&#9733;</label>

                    <input type="radio" id="star1" name="rating" value="1" /><label for="star1"
                        title="1 star">&#9733;</label>

                </div>

            </div>



            <!--<fieldset class="rating">-->

            <!--      <legend>Rate Us:</legend>-->

            <!--      <input type="radio" id="star5" name="rating" value="5" /><label for="star5" title="5 stars">&#9733;</label>-->

            <!--      <input type="radio" id="star4" name="rating" value="4" /><label for="star4" title="4 stars">&#9733;</label>-->

            <!--      <input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="3 stars">&#9733;</label>-->

            <!--      <input type="radio" id="star2" name="rating" value="2" /><label for="star2" title="2 stars">&#9733;</label>-->

            <!--      <input type="radio" id="star1" name="rating" value="1" /><label for="star1" title="1 star">&#9733;</label>-->

            <!--  </fieldset>-->



            <div class="input-group">

                <label for="feedback_type">Type of Feedback</label>

                <select name="feedback_type" id="feedback_type" style="background-color:#c7cdfd;">

                    <option value="">Select</option>

                    <option value="Suggestion">Suggestion</option>

                    <option value="Complaint">Complaint</option>

                    <option value="Compliment">Compliment</option>

                </select>

            </div>

            <div class="input-group mb50">

                <label for="feedback">Comments <span>*</span></label>

                <textarea name="feedback" id="feedback" rows="5" style="background-color:#a4b1fc;" required></textarea>

            </div>

            <div>

                <button type="submit" class="submit-btn" id="submit_btn">SUBMIT</button>

            </div>

        </form>



    </div>



    <!-- SweetAlert2 JS -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@10.5.0/dist/sweetalert2.all.min.js"></script>






 
    <script>
    $(document).ready(function() {
        $("#feedback-form").on('submit', function(e) {
            e.preventDefault();

            var formData = new FormData(this);
            var submitBtn = $("#feedback-form :submit");
            var originalBtnText = submitBtn.html();

            submitBtn.attr('disabled', true).html("Please wait...");

            $.ajax({
                url: "feedback-mailer.php",
                method: "POST",
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {
                    submitBtn.attr('disabled', false).html(originalBtnText);
                 

                    if (response === "success") {
                        $("#feedback-form")[0].reset();
                        Swal.fire({
                            title: "Success!",
                            text: "Message has been successfully sent.",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: "Something went wrong. Please try again.",
                            icon: "error"
                        });
                    }
                },
                error: function(xhr, status, error) {
                    submitBtn.attr('disabled', false).html(originalBtnText);
                    Swal.fire({
                        title: "Error!",
                        text: "AJAX Error: " + error,
                        icon: "error"
                    });
                }
            });
        });
    });
    </script>

</body>

</html>