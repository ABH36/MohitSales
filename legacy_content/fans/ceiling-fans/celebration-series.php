<?php include '../../config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Celebration Series - Mohit Sales Corporation Pvt. Ltd.</title>
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


<style>
    .card_box {
        background: linear-gradient(135deg, #ffffff, #f4f4f4);
        border-radius: 18px;
        padding: 30px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
    }

    .product-card {
        min-height: 280px;
    }

    .product-link {
        text-decoration: none;
    }

    .product-img {
        max-width: 100%;
        height: auto;
        margin-bottom: 15px;
        transition: transform 0.3s ease;
    }

    .product-img:hover {
        transform: scale(1.05);
    }

    .product-title {
        font-size: 22px;
        font-weight: 600;
        color: #222;
    }



    .pricelist-btn {
        display: inline-block;
        padding: 12px 28px;
        background: linear-gradient(45deg, #000, #333);
        color: #fff;
        border-radius: 30px;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .pricelist-btn:hover {
        background: linear-gradient(45deg, #c1272d, #f7931e);
        color: #000;
    }

    .product-features {
        list-style: none;
        padding-left: 0;
    }

    .product-features li {
        position: relative;
        padding-left: 30px;
        margin-bottom: 10px;
        font-size: 18px;
        color: #444;
    }

    .product-features li::before {
        content: "✔";
        position: absolute;
        left: 0;
        top: 0;
        color: #0055a9;
        font-weight: bold;
    }

    .card_box {
        margin-bottom: 30px;
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
                                        <li><span><a href="<?php echo BASE_URL . 'fans.php'; ?>">Fans</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'fans/ceiling-fans.php'; ?>">Ceiling Fans</a></span></li>
                                        <li><span>Celebration Series</span></li>
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
                    <h2>Celebration Series</h2>

                </div>

                <section class="products-section">
                    <div class="container">


                        <!-- Products Grid -->

                        <div class="row product-wrapper">
                            <div class="col-12">
                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">

                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/ceiling_fans/Vital-Plus.png'; ?>"
                                                alt="Design Series Ceiling Fan" class="product-img">
                                            <h3 class="product-title">VITAL PLUS</h3>

                                        </div>
                                        <div class="col-md-6">
                                            <ul class="product-features">
                                                <h3 class="product-title mb-4">FEATURES</h3>
                                                <li> 1 Star Rating</li>
                                                <li>3 Years Product Warranty</li>
                                                <li> Higher Air Circulation with broad blade design</li>
                                                <li>More comfort with High Speed Operations</li>
                                                <li> Rust-proof Aluminium blades</li>
                                                <li> Up to 33% Savings* on electricity bill</li>
                                                <li> High Gloss Mirror Finish</li>
                                            </ul>

                                            <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                class="pricelist-btn">
                                                Send Enquiry →
                                            </a>
                                        </div>

                                    </div>
                                </div>
                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">

                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/ceiling_fans/Vital-Matt-Black-1.png'; ?>"
                                                alt="Design Series Ceiling Fan" class="product-img">
                                            <h3 class="product-title">VITAL</h3>

                                        </div>
                                        <div class="col-md-6">
                                            <ul class="product-features">
                                                <h3 class="product-title mb-4">FEATURES</h3>
                                                <li>1 Star Rating</li>
                                                <li>3 Years Product Warranty</li>
                                                <li>Higher Air Circulation with broad blade design</li>
                                                <li>More comfort with High Speed Operations</li>
                                                <li>Rust-proof Aluminium blades</li>
                                                <li>Up to 33% Savings* on electricity bill</li>
                                                <li>High Gloss Mirror Finish</li>
                                            </ul>

                                            <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                class="pricelist-btn">
                                                Send Enquiry →
                                            </a>
                                        </div>

                                    </div>
                                </div>
                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">

                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/ceiling_fans/Zoomer-Prime-Choco-Brown-1.png'; ?>"
                                                alt="Design Series Ceiling Fan" class="product-img">
                                            <h3 class="product-title">ZOOMER PRIME</h3>

                                        </div>
                                        <div class="col-md-6">
                                            <ul class="product-features">
                                                <h3 class="product-title mb-4">FEATURES</h3>
                                                <li>1 Star Rating</li>
                                                <li>3 Years Product Warranty</li>
                                                <li>Higher Air Circulation with broad blade design</li>
                                                <li>More comfort with High Speed Operations</li>
                                                <li>Rust-proof Aluminium blades</li>
                                                <li>Up to 33% Savings* on electricity bill</li>
                                                <li>High Gloss Mirror Finish</li>
                                            </ul>

                                            <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                class="pricelist-btn">
                                                Send Enquiry →
                                            </a>
                                        </div>

                                    </div>
                                </div>


                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">

                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/ceiling_fans/Zoomer-DLX_-Luster-Brown.png'; ?>"
                                                alt="Design Series Ceiling Fan" class="product-img">
                                            <h3 class="product-title">ZOOMER DLX</h3>

                                        </div>
                                        <div class="col-md-6">
                                            <ul class="product-features">
                                                <h3 class="product-title mb-4">FEATURES</h3>
                                                <li>1 Star Rating</li>
                                                <li>2 Years Product Warranty</li>
                                                <li>Corrosion Resistant G-Tech Blades</li>
                                                <li>More comfort with High Speed Operations</li>
                                                <li>Rust-proof Aluminium blades</li>
                                                <li>Up to 33% Savings* on electricity bill</li>
                                                <li>High Gloss Mirror Finish</li>
                                            </ul>

                                            <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                class="pricelist-btn">
                                                Send Enquiry →
                                            </a>
                                        </div>

                                    </div>
                                </div>
                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">

                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/ceiling_fans/ZOOMER-Bianco-1.png'; ?>"
                                                alt="Design Series Ceiling Fan" class="product-img">
                                            <h3 class="product-title">ZOOMER</h3>

                                        </div>
                                        <div class="col-md-6">
                                            <ul class="product-features">
                                                <h3 class="product-title mb-4">FEATURES</h3>
                                                <li>1 Star Rating</li>
                                                <li>2 Years Product Warranty</li>
                                                <li>Corrosion Resistant G-Tech Blades</li>
                                                <li>More comfort with High Speed Operations</li>
                                                <li>Rust-proof Aluminium blades</li>
                                                <li>Up to 33% Savings* on electricity bill</li>
                                                <li>High Gloss Mirror Finish</li>
                                            </ul>

                                            <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                class="pricelist-btn">
                                                Send Enquiry →
                                            </a>
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>





                    </div>
                </section>



        </section>



    </main>
    <!-- Body main wrapper end -->

    <?php include ROOT_PATH . '/common/footer.php'; ?>

    <?php include ROOT_PATH . '/common/scripts.php'; ?>


</body>


</html>