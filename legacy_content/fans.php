<?php include './config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Fans - Mohit Sales Corporation Pvt. Ltd.</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <?php include ROOT_PATH . '/common/links.php'; ?>

</head>

<style>
    .products-section {
        padding: 80px 20px;
        background: #f8f9fb;
    }

    .container {
        max-width: 1200px;
        margin: auto;
    }

    /* Title */
    .section-title {
        text-align: center;
        margin-bottom: 50px;
    }

    .section-title h2 {
        font-size: 36px;
        font-weight: 700;
        color: #222;
        position: relative;
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

    .section-title p {
        color: #666;
        font-size: 16px;
    }

    /* Products Grid */
    .products-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 25px;
    }

    /* Card */
    .product-card {
        background: #fff;
        padding: 20px;
        border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        text-align: center;
        display: block;
        text-decoration: none;
        color: inherit;
        /* height: 410px;
        width: 280px; */
    }


    .product-card:hover {
        transform: translateY(-10px);
    }

    .product-card img {
        width: 100%;
        border-radius: 10px;
        margin-bottom: 15px;
    }


    .pricelist-btn {
        display: inline-block;
        pointer-events: none;
    }


    .product-card h3 {
        font-size: 20px;
        margin-bottom: 10px;
    }

    .product-card p {
        font-size: 14px;
        color: #555;
        margin-bottom: 15px;
    }

    /* Read More Button */
    .read-more {
        display: inline-block;
        padding: 10px 22px;
        background: linear-gradient(135deg, #007bff, #00c6ff);
        color: #fff;
        border-radius: 30px;
        text-decoration: none;
        font-size: 14px;
        transition: 0.3s;
    }

    .read-more:hover {
        background: linear-gradient(135deg, #00c6ff, #007bff);
    }

    /* Responsive */
    @media (max-width: 992px) {
        .products-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 576px) {
        .products-grid {
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
                                <h1 class="rs-breadcrumb-title">Fans</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'polycab.php' ?>">Polycab</a></span></li>
                                        <li><span>Fans</span></li>
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
                    <h2>Fans</h2>

                </div>

                <section class="products-section">
                    <div class="container">

                        <!-- Section Title -->


                        <!-- Products Grid -->
                        <div class="products-grid">

                            <div class="product-card">

                                <a href="<?php echo BASE_URL . 'fans/ceiling-fans.php'; ?>">
                                    <img src="assets/images/our_products/fans/ceiling_fan.png" alt="Ceiling Fans">

                                    <h3>Ceiling Fans</h3>

                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>


                            </div>

                            <div class="product-card">
                                <a href="<?php echo BASE_URL . 'fans/table-fans.php'; ?>">
                                    <img src="assets/images/our_products/fans/table-fan.png" alt="Product">
                                    <h3>Table Fans</h3>
                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>
                            </div>

                            <div class="product-card">
                                <a href="<?php echo BASE_URL . 'fans/pedestal-fans.php'; ?>">
                                    <img src="assets/images/our_products/fans/pedestal-fan.png" alt="Product">
                                    <h3>Pedestal Fans</h3>
                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>
                            </div>

                            <div class="product-card">
                                <a href="<?php echo BASE_URL . 'fans/wall-fans.php'; ?>">
                                    <img src="assets/images/our_products/fans/Wall-Fan.png" alt="Product">
                                    <h3>Wall Fans</h3>
                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>
                            </div>

                            <div class="product-card">
                                <a href="<?php echo BASE_URL . 'fans/exhaust-fans.php'; ?>">
                                    <img src="assets/images/our_products/fans/EXHAUST-FAN.png" alt="Product">
                                    <h3>Exhaust Fans</h3>
                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>
                            </div>

                            <div class="product-card">
                                <a href="<?php echo BASE_URL . 'fans/farrata-fans.php'; ?>">
                                    <img src="assets/images/our_products/fans/Farrata-Fan.png" alt="Product">
                                    <h3>Farrata Fans</h3>
                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>
                            </div>

                            <div class="product-card">
                                <a href="<?php echo BASE_URL . 'fans/air-circulator.php'; ?>">
                                    <img src="assets/images/our_products/fans/Air-Circulator.png" alt="Product">
                                    <h3>Air Circulator Fans</h3>
                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>
                            </div>

                        </div>

                    </div>
                </section>


                <!-- <div class="container mt-4">
                    <div class="row mt-4">
                        <div class="col-md-4">
                            <div class="mcb-card">
                                <a href="<?php echo BASE_URL . 'switchgears/MCB.php' ?>">
                                    <div class="mcb-image">
                                        <img src="assets/images/switchgears/MCB.jpg" alt="MCB Image">
                                    </div>
                                    <div class="mcb-content">
                                        <div class="mcb-title">MCB</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mcb-card">
                                <a href="<?php echo BASE_URL . 'switchgears/ISOLATOR.php' ?>">
                                    <div class="mcb-image">
                                        <img src="assets/images/switchgears/ISOLATOR.png" alt="ISOLATOR">
                                    </div>
                                    <div class="mcb-content">
                                        <div class="mcb-title">Isolators</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mcb-card">
                                <a href="<?php echo BASE_URL . 'switchgears/RCCB.php' ?>">
                                    <div class="mcb-image">
                                        <img src="assets/images/switchgears/RCCB.png" alt="RCCB">
                                    </div>
                                    <div class="mcb-content">
                                        <div class="mcb-title">RCCB</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                    </div>
                    <div class="row mt-4">
                        <div class="col-md-4">
                            <div class="mcb-card">
                                <a href="<?php echo BASE_URL . 'switchgears/RCBO.php' ?>">
                                    <div class="mcb-image">
                                        <img src="assets/images/switchgears/RCBO.png" alt="RCBO">
                                    </div>
                                    <div class="mcb-content">
                                        <div class="mcb-title">RCBO</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mcb-card">
                                <a href="<?php echo BASE_URL . '#' ?>">
                                    <div class="mcb-image">
                                        <img src="assets/images/switchgears/DB.png" alt="DB">
                                    </div>
                                    <div class="mcb-content">
                                        <div class="mcb-title">DB</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mcb-card">
                                <a href="<?php echo BASE_URL . 'switchgears/MCB-SWITCH.php' ?>">
                                    <div class="mcb-image">
                                        <img src="assets/images/switchgears/MCB-chnageover-switch.png" alt="MCB Changeover Switch">
                                    </div>
                                    <div class="mcb-content">
                                        <div class="mcb-title">MCB Changeover Switch</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                    </div>
                    <div class="row mt-4">
                        <div class="col-md-4">
                            <div class="mcb-card">
                                <a href="<?php echo BASE_URL . 'switchgears/ACCL.php' ?>">
                                    <div class="mcb-image">
                                        <img src="assets/images/switchgears/ACCL.png" alt="ACCL">
                                    </div>
                                    <div class="mcb-content">
                                        <div class="mcb-title">ACCL</div>
                                    </div>
                                </a>
                            </div>
                        </div>



                    </div>
                </div> -->
        </section>



    </main>
    <!-- Body main wrapper end -->

    <?php include ROOT_PATH . '/common/footer.php'; ?>

    <?php include ROOT_PATH . '/common/scripts.php'; ?>


</body>


</html>