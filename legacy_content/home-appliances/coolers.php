<?php include '../config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Coolers - Mohit Sales Corporation Pvt. Ltd.</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <?php include ROOT_PATH . '/common/links.php'; ?>

</head>

<style>
    .features-box {
        max-width: 600px;
        background: #ffffff;
        padding: 25px;
        border-radius: 14px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
    }

    .features-box h2 {
        text-align: center;
        color: #333;
        margin-bottom: 20px;
    }

    .features-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }

    .features-grid ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .features-grid li {
        padding: 10px 12px;
        margin-bottom: 10px;
        background: #f5f7fa;
        border-left: 4px solid #ff6a00;
        border-radius: 6px;
        font-size: 14px;
        color: #444;
        transition: all 0.3s ease;
    }

    .features-grid li:hover {
        background: #ff6a00;
        color: #ffffff;
        transform: translateX(5px);
    }

    /* Override feature card layout on coolers page to give specs table and features icons more space */
    .feature-card {
        display: flex !important;
        gap: 40px !important;
        align-items: flex-start !important;
        background: #ffffff !important;
        border-radius: 16px !important;
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08) !important;
        padding: 35px !important;
        margin-bottom: 30px !important;
        border: 1px solid #eaeaea !important;
        max-width: 1200px !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    .feature-image {
        flex: 0 0 450px !important;
        max-width: 450px !important;
        text-align: center !important;
    }

    .feature-image img {
        width: 100% !important;
        height: auto !important;
        border-radius: 12px !important;
        border: 1px solid #ebebeb !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03) !important;
    }

    .feature-content {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 20px !important;
    }

    .feature-content h2 {
        font-size: 24px !important;
        font-weight: 700 !important;
        color: #1a202c !important;
        margin: 0 !important;
        position: relative !important;
        padding-bottom: 10px !important;
    }

    .feature-content h2::after {
        content: "" !important;
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 40px !important;
        height: 3px !important;
        background: #ff6a00 !important;
        border-radius: 2px !important;
    }

    .feature-content img {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02) !important;
    }

    /* Responsive for mobile */
    @media (max-width: 991px) {
        .feature-card {
            flex-direction: column !important;
            align-items: center !important;
            gap: 25px !important;
            padding: 20px !important;
        }
        .feature-image {
            flex: 0 0 auto !important;
            max-width: 100% !important;
            width: 380px !important;
        }
    }

    @media (max-width: 600px) {
        .features-grid {
            grid-template-columns: 1fr;
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
                                <h1 class="rs-breadcrumb-title">Home Appliances</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'polycab.php' ?>">Polycab</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'home-appliances.php' ?>">Home Appliances</a></span></li>
                                       
                                        <li><span>Coolers</span></li>
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
                    <h2>COOLER</h2>

                </div>


                <div class="row align-items-center">
                    <div class="col-md-12">
                        <div class="feature-card">
                            <div class="switchgears_content">
                                <p>
                                  There’s nothing better than some cool comfort after a hard day’s work. Or some fresh breeze on hot and dry days. Now get everything you wished for, at the electricity cost of operating a fan… cool, isnt’t it? Presenting Polycab innovation range of air coolers! Designed for maximum cooling and any kind of space, it ushers in natural, healthy air; is easy to move and operate, and pocket friendly too. Bring home a Polycab air cooler; bring home a cool friend for life.
                                </p>
                            </div>
                        </div>
                    </div>


                </div>

                <div class="row mt-4">
                    <div class="col-md-12">
                        <div class="feature-card">
                            <div class="feature-image">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/1.png' ?>" alt="">
                            </div>

                            <div class="feature-content">
                                <h2>FEATURES</h2>
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/2.png' ?>" alt="" class="">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/3.png' ?>" alt="" class="mt-4">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-md-12">
                        <div class="feature-card">
                            <div class="feature-image">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/4.png' ?>" alt="">
                            </div>

                            <div class="feature-content">
                                <h2>FEATURES</h2>
                            
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/5.png' ?>" alt="" class="">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/6.png' ?>" alt="" class="mt-4">
                            </div>
                        </div>
                    </div>
                </div>


                <div class="row mt-4">
                    <div class="col-md-12">
                        <div class="feature-card">
                            <div class="feature-image">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/7.png' ?>" alt="">
                            </div>

                            <div class="feature-content">
                                <h2>FEATURES</h2>
                            
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/8.png' ?>" alt="" class="">
                                <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/coolers/9.png' ?>" alt="" class="mt-4">
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