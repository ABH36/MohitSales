<?php include '../../config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Three Phase - Mohit Sales Corporation Pvt. Ltd.</title>
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
        width: 280px;
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
                                <h1 class="rs-breadcrumb-title">Solar</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'polycab.php' ?>">Polycab</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'solar.php'; ?>">Solar</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'solar/solar-grid-tie-inverter.php'; ?>">Solar Grid Tie Inverter</a></span></li>
                                        <li><span>Three Phase</span></li>
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
                    <h2>Three Phase</h2>

                </div>

                <section class="products-section">
                    <div class="container">


                        <!-- Products Grid -->

                        <div class="row product-wrapper">
                            <div class="col-12">
                                <h4 class="text-center mb-4">SOLAR GRID TIE INVERTERS THREE PHASE</h4>
                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/solar/three_phase/1.png'; ?>"
                                                alt="Single Phase" class="product-img">
                                            <h3 class="product-title">5KW - 30KW</h3>
                                        </div>

                                        <div class="col-md-6">
                                           
                                        </div>
                                    </div>
                                </div>

                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/solar/three_phase/2.png'; ?>"
                                                alt="25KW – 40KW" class="product-img">
                                            <h3 class="product-title">25KW – 40KW</h3>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="specs-box">
                                                <ul class="specs-list">
                                                    <li>More reliable &amp; efficient with world-class components for 20 years design life</li>
                                                    <li>High-frequency switching technology</li>
                                                    <li>Low start-up voltage and ultra wide MPPT range for more energy generation</li>
                                                    <li>Multiple protection levels</li>
                                                    <li>THDi &lt; 1.5% | Max. Efficiency 98.7%</li>
                                                    <li>IP65 for outdoor installations</li>
                                                    <li>Compact size and light weight design for easy installation</li>
                                                    <li>RS485; Wi-Fi / GPRS / LAN Interface (Optional)</li>
                                                    <li>Free remote monitoring on Web Portal and Mobile App</li>
                                                    <li>5 years standard warranty, extendable up to 20 years</li>
                                                </ul>

                                                <div class="button_center">
                                                    <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="pricelist-btn text-center">
                                                        Send Enquiry →
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/solar/three_phase/3.png'; ?>"
                                                alt="50KW – 60KW" class="product-img">
                                            <h3 class="product-title">50KW – 60KW</h3>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="specs-box">

                                                <ul class="specs-list">
                                                    <li>Maximum efficiency over 98.9%, EU efficiency over 98.5%</li>
                                                    <li>Wide MPPT voltage range with 4 MPPT design and precise MPPT algorithm</li>
                                                    <li>IP65 certified for outdoor installation</li>
                                                    <li>Low harmonic distortion | THDi &lt; 3%</li>
                                                    <li>Integrated DC switch</li>
                                                    <li>Intelligent redundant fan-cooling</li>
                                                    <li>5 years standard warranty with extended warranty option</li>
                                                    <li>Onboard SPDs for DC &amp; AC sides</li>
                                                    <li>Free remote monitoring on Web Portal &amp; Mobile App</li>
                                                </ul>

                                                <div class="button_center">
                                                    <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="pricelist-btn text-center">
                                                        Send Enquiry →
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/solar/three_phase/4.png'; ?>"
                                                alt="80KW – 110KW" class="product-img">
                                            <h3 class="product-title">80KW – 110KW</h3>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="specs-box">

                                                <ul class="specs-list">
                                                    <li>Maximum Efficiency 98.7%</li>
                                                    <li>Wide voltage range and low startup voltage</li>
                                                    <li>Supports 50% DC overload, 9/10 MPPT design with precise MPPT algorithm</li>
                                                    <li>THDi &lt; 3%, Low Harmonic Distortion</li>
                                                    <li>IP66 for outdoor installation</li>
                                                    <li>Anti-resonance, supporting over 6MW paralleled in one transformer</li>
                                                    <li>Intelligent fan cooling</li>
                                                    <li>High precision intelligent string monitoring</li>
                                                    <li>Night SVG function</li>
                                                    <li>Smart I-V Curve Diagnosis supported</li>
                                                    <li>Fuse-free design to avoid hazard</li>
                                                    <li>Type II SPD for both DC and AC side</li>
                                                    <li>Leakage current repression technology</li>
                                                    <li>Volt-Watt work mode integrated</li>
                                                    <li>DC input reverse alarm</li>
                                                    <li>Integrated DC and AC (optional) disconnect switches</li>
                                                    <li>RS-485, Ethernet; Wi-Fi / GPRS / LAN; PLC (optional) monitoring interface</li>
                                                    <li>Support “Y” type connection in DC side</li>
                                                    <li>Supports aluminium wire access to reduce cost</li>
                                                    <li>Free remote monitoring on Web Portal and Mobile App</li>
                                                    <li>5 Years standard warranty, extendable up to 20 years</li>
                                                </ul>

                                                <div class="button_center">
                                                    <a href="<?php echo BASE_URL . 'contact-us.php'; ?>" class="pricelist-btn text-center">
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
                </section>



        </section>



    </main>
    <!-- Body main wrapper end -->

    <?php include ROOT_PATH . '/common/footer.php'; ?>

    <?php include ROOT_PATH . '/common/scripts.php'; ?>


</body>


</html>