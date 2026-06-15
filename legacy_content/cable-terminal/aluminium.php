<?php include '../config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Aluminium - Mohit Sales Corporation Pvt. Ltd.</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <?php include ROOT_PATH . '/common/links.php'; ?>

</head>

<style>
    .product-card {
        background: #ffffff;
        width: 100%;
        border-radius: 14px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        transition: transform 0.3s ease;
    }

    .product-card:hover {
        transform: translateY(-6px);
    }

    .product-img {
        padding: 15px;
        background: #fff;
    }

    .product-img img {
        width: 100%;
        height: 250px;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .product-img img:hover {
        transform: scale(1.03);
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }

    .product-content {
        padding: 18px;
    }

    .product-title {
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 10px;
        color: #c1272d;
    }

    .product-details {
        font-size: 18px;
        color: #555;
        line-height: 1.6;
        margin-bottom: 18px;
    }

    .product-details span {
        font-weight: 600;
        color: #333;
    }

    .enquiry-btn {
        display: block;
        text-align: center;
        background: linear-gradient(135deg, #c1272d, #f7931e);
        color: #fff;
        padding: 12px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        transition: background 0.3s ease;
    }

    .enquiry-btn:hover {
        background: linear-gradient(135deg, #0056b3, #003d80);
        color: #fff;
    }

    .section-title h2::after {
        content: "";
        width: 60px;
        height: 4px;
        background: #007bff;
        display: block;
        margin: 12px auto;
        border-radius: 2px;
    }
</style>



<body class="rs-smoother-yes rtl">

    <?php include ROOT_PATH . '/common/header.php'; ?>

    <!-- Body main wrapper start -->
    <main>

        <!-- breadcrumb area start -->
        <section class="rs-breadcrumb-area rs-breadcrumb-one p-relative">
            <div class="rs-breadcrumb-bg"
                data-background="<?php echo BASE_URL . 'assets/images/inner-banner/products.png'; ?>"></div>
            <div class="container">
                <div class="row">
                    <div class="col-xxl-12 col-xl-12 col-lg-12">
                        <div class="rs-breadcrumb-content-wrapper">
                            <div class="rs-breadcrumb-title-wrapper">
                                <h1 class="rs-breadcrumb-title">Cable Terminal</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'dowells.php' ?>">Dowells</a></span></li>

                                        <li><span><a href="<?php echo BASE_URL . 'cable-terminal.php' ?>">Cable Terminal</a></span></li>
                                        <li><span>Aluminium</span></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- breadcrumb area end -->

        <section class="catalogue-section">
            <div class="container">

                <div class="section-title text-center mb-5">
                    <h2>Aluminium</h2>

                </div>


                <!-- <div class="row align-items-center">
                    <div class="col-md-12">
                        <div class="feature-card">
                            <div class="switchgears_content">
                                <p>

                                    Give your body the tender loving care it deserves, with Polycab water heaters. Combining innovations in hydrotherapy with traditional insights, these hot water marvels turn a daily routine into a wellness ritual, in the comfort of your home. Watch the dirt and fatigue wash away from your body. Feel the hot water gently massage your shoulders, neck, and back; soothing your body and mind in a matter of minutes. Before you know it, you will be fully charged and ready.
                                </p>
                            </div>
                        </div>
                    </div>


                </div> -->

                <div class="row mt-4">
                    <h4>Aluminium Tube Terminals</h4>
                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/1.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Short Barrel</div>

                                <div class="product-details">
                                    <span>Material:</span> Electrolytic Aluminium IS 5082 / IS 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 2.5 Sqmm to 1000 Sqmm, with varying bolt sizes.<br>

                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/2.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Long Barrel Terminals</div>

                                <div class="product-details">
                                    <span>Material:</span> Electrolytic Aluminium IS 5082 / IS 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 2.5 Sqmm to 1000 Sqmm, with varying bolt sizes.
                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/3.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Two Holes</div>

                                <div class="product-details">
                                    <span>Material:</span> Electrolytic Aluminium IS 5082 / IS 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 150 Sqmm to 630 Sqmm<br><br>


                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>


                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/4.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Sector Long Barrel</div>

                                <div class="product-details">
                                    <span>Material:</span> Electrolytic Aluminium IS 5082/IS 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 25 Sqmm to 630 Sqmm, with varying bolt sizes.<br><br>


                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/5.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">XLPE Conductor</div>

                                <div class="product-details">
                                    <span>Material:</span> Electrolytic Aluminium IS 5082/IS 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 25 Sqmm to 1000 Sqmm<br><br><br>


                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/6.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Tinned Aluminium Terminal</div>

                                <div class="product-details">
                                    <span>Material:</span> Electrolytic Aluminium IS 5082/IS 8309<br>
                                    <span>Finishing:</span> ELECTRO TINNED (BIMETALIC PLATING)<br>
                                    <span>Size:</span> 2.5 Sqmm to 1000 Sqmm, with varying bolt sizes.


                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <h4 class="mt-4">Aluminium Reducer Terminals</h4>
                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/7.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Aluminium Reducer Terminals</div>

                                <div class="product-details">
                                    <span>Material:</span> Electrolytic Aluminium IS 5082/IS 8309<br>
                                    <span>Finishing:</span> --<br>
                                    <span>Size:</span> 2.5 Sqmm to 300 Sqmm

                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>




                </div>

                <div class="row mt-4">
                    <h4 class="mt-4">Connector</h4>
                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/8.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">In Line Connector</div>

                                <div class="product-details">
                                    <span>Material:</span> Copper<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 25 Sqmm to 500 Sqmm<br><br>

                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/aluminium/9.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">In Line Connector</div>

                                <div class="product-details">
                                    <span>Material:</span> Electrolytic Aluminium IS 5082/IS 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 25 Sqmm to 500 Sqmm

                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>



                </div>

            </div>


        </section>



    </main>
    <!-- Body main wrapper end -->

    <?php include ROOT_PATH . '/common/footer.php'; ?>

    <?php include ROOT_PATH . '/common/scripts.php'; ?>


</body>


</html>