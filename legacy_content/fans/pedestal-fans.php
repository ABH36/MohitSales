<?php include '../config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Pedestal Fans - Mohit Sales Corporation Pvt. Ltd.</title>
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
        max-width: 50%;
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

<style>
    .specs-box {
        background: #fff;
        padding: 20px;
        border-radius: 10px;

    }

    .specs-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #ddd;
    }

    .specs-table th,
    .specs-table td {
        border: 1px solid #ddd;
        padding: 14px 10px;
        text-align: center;
        font-size: 15px;
    }

    .specs-table th {
        background: #f5f5f5;
        font-weight: 600;
        color: #222;
    }

    .specs-table td {
        color: #444;
    }

    .specs-table tbody tr:hover td {
        background: #fafafa;
    }

    .button_center {
        margin-top: 10px;
        text-align: center;
    }

    .table-responsive {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .specs-table {
        min-width: 100%;
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

                                        <li><span>Pedestal Fans</span></li>
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
                    <h2>Pedestal Fans</h2>

                </div>

                <section class="products-section">
                    <div class="container">


                        <!-- Products Grid -->

                        <div class="row product-wrapper">
                            <div class="col-12">


                                <div class="card_box">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/pedestal_fans/Elanza-PP01-Pedestal-Fan-1.png'; ?>"
                                                alt="ELANZA PP01 Table Fan" class="product-img">
                                            <h3 class="product-title">ELANZA PP01</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>60 | 105</td>
                                                                <td>1320</td>
                                                                <td>80</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div class="card_box">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/pedestal_fans/Elanza-PP01-Pedestal-Fan-1 (1).png'; ?>"
                                                alt="THUNDERSTORM Table Fan" class="product-img">
                                            <h3 class="product-title">THUNDERSTORM</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>125</td>
                                                                <td>2000</td>
                                                                <td>90</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div class="card_box mt-4">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/pedestal_fans/Unicorn-Pedestal-Fan-1.png'; ?>"
                                                alt="UNICORN Table Fan" class="product-img">
                                            <h3 class="product-title">UNICORN</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>55</td>
                                                                <td>1350</td>
                                                                <td>70</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div class="card_box">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/pedestal_fans/ELANZA-MINI_900x506-new.png'; ?>"
                                                alt="ELANZA MINI Table Fan" class="product-img">
                                            <h3 class="product-title">ELANZA MINI</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>47</td>
                                                                <td>1300</td>
                                                                <td>60</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div class="card_box">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/pedestal_fans/Fantasy-DLX-1.png'; ?>"
                                                alt="FANTASY DLX Table Fan" class="product-img">
                                            <h3 class="product-title">FANTASY DLX</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>110</td>
                                                                <td>2000</td>
                                                                <td>100</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>


                                <div class="card_box">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/fans/pedestal_fans/Eliana-Pedestal-2.png'; ?>"
                                                alt="ELIANA Table Fan" class="product-img">
                                            <h3 class="product-title">ELIANA</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>50</td>
                                                                <td>1350</td>
                                                                <td>65</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>


                                <div class="card_box">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="https://placehold.co/253x253"
                                                alt="AERY Table Fan" class="product-img">
                                            <h3 class="product-title">AERY</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>50</td>
                                                                <td>1350 | 2100</td>
                                                                <td>75 | 95</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>


                                <div class="card_box mt-4">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="https://placehold.co/253x253"
                                                alt="AMAZE Table Fan" class="product-img">
                                            <h3 class="product-title">AMAZE</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>60 | 105</td>
                                                                <td>1320</td>
                                                                <td>80</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div class="card_box">
                                    <div class="row align-items-center product-card">

                                        <!-- LEFT SIDE : IMAGE + TITLE -->
                                        <div class="col-md-6 text-center">
                                            <img src="https://placehold.co/253x253"
                                                alt="ASPIRE Table Fan" class="product-img">
                                            <h3 class="product-title">ASPIRE</h3>
                                        </div>

                                        <!-- RIGHT SIDE : TECHNICAL SPECIFICATIONS + BUTTON -->
                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <h3 class="product-title mb-4">Technical Specifications</h3>

                                                <div class="table-responsive">
                                                    <table class="specs-table bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Sweep (MM)</th>
                                                                <th>Power Input (W)</th>
                                                                <th>Speed (RPM)</th>
                                                                <th>Air Delivery (CMM)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>400</td>
                                                                <td>70</td>
                                                                <td>1350</td>
                                                                <td>85</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div class="button_center mt-3 text-center">
                                                        <a href="<?php echo BASE_URL . 'contact-us.php'; ?>"
                                                            class="pricelist-btn text-center">
                                                            Send Enquiry →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
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