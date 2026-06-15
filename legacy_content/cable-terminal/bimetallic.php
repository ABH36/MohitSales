<?php include '../config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Bimetallic - Mohit Sales Corporation Pvt. Ltd.</title>
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

<style>
    .download-catalogue {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 26px;
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        text-decoration: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #ff7a18, #ffb347);
        box-shadow: 0 8px 20px rgba(255, 122, 24, 0.35);
        transition: all 0.3s ease;
        overflow: hidden;
    }

    /* Hover effect */
    .download-catalogue:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px rgba(255, 122, 24, 0.5);
        color: #fff;
    }

    /* Shine animation */
    .download-catalogue::before {
        content: "";
        position: absolute;
        top: 0;
        left: -75%;
        width: 50%;
        height: 100%;
        background: rgba(255, 255, 255, 0.35);
        transform: skewX(-25deg);
        transition: 0.5s;
    }

    .download-catalogue:hover::before {
        left: 130%;
    }

    /* Mobile friendly */
    @media (max-width: 576px) {
        .download-catalogue {
            padding: 10px 20px;
            font-size: 14px;
        }
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
                                        <li><span>Bimetallic</span></li>
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

                <div class="section-title position-relative text-center mb-5">
                    <h2>Bimetallic</h2>
                    <a href="catalogue.pdf"
                        class="position-absolute end-0 top-50 translate-middle-y download-catalogue">
                        Download Catalogue
                    </a>
                </div>


                <div class="row mt-4">
                    <!-- <h4>Aluminium Tube Terminals</h4> -->
                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/bimetallic/1.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Bimetallic Terminals</div>

                                <div class="product-details">
                                    <span>Material:</span> EC Grade Copper is-191, Electrolytic Aluminium is 5082/is 8309<br>
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
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/bimetallic/2.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Friction Welded Connectors</div>

                                <div class="product-details">
                                    <span>Material:</span> EC Grade Copper is-191, Electrolytic Aluminium is 5082/is 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 16-16 sq,mm to 240-240sq.mm<br><br><br>
                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/bimetallic/3.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Bimetallic Terminals Two Holes</div>

                                <div class="product-details">
                                    <span>Material:</span> EC Grade Copper is-191, Electrolytic Aluminium is 5082/is 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 25 Sqmm to 630 Sqmm, with varying bolt sizes.


                                </div>

                                <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="enquiry-btn">Send Enquiry</a>
                            </div>
                        </div>
                    </div>


                    <div class="col-md-4 mt-4">
                        <div class="product-card">
                            <div class="product-img">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/dowells/cable_terminal/bimetallic/4.jpg' ?>" alt="" class="img-fluid">
                            </div>

                            <div class="product-content">
                                <div class="product-title">Reverse Bimetallic Terminals</div>

                                <div class="product-details">
                                    <span>Material:</span> EC Grade Copper is-191, Electrolytic Aluminium is 5082/is 8309<br>
                                    <span>Finishing:</span> Natural<br>
                                    <span>Size:</span> 25 Sqmm to 630 Sqmm, with varying bolt sizes.


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