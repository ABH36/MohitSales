<?php include '../config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>UPVC Conduit - Mohit Sales Corporation Pvt. Ltd.</title>
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
        width: 100%;
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

<style>
    .table-section {
        padding: 60px 20px;
        background: #f4f6f8;
        font-family: 'Segoe UI', sans-serif;
    }

    .table-section h2 {
        text-align: center;
        margin-bottom: 30px;
        font-size: 30px;
        color: #222;
    }

    .table-wrapper {
        max-width: 1200px;
        margin: auto;
        overflow-x: auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        background: linear-gradient(135deg, #1f2933, #374151);
        color: #ffffff;
    }

    thead th {
        padding: 14px 10px;
        font-size: 14px;
        text-transform: uppercase;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    tbody td {
        padding: 14px 10px;
        text-align: center;
        font-size: 15px;
        color: #333;
        border: 1px solid #e5e7eb;
    }

    tbody tr:nth-child(even) {
        background: #f9fafb;
    }

    tbody tr:hover {
        background: #eef2f7;
    }

    .note {
        max-width: 1000px;
        margin: 25px auto 0;
        text-align: center;
        font-size: 16px;
        color: #333;
    }

    .note span {
        display: inline-block;
        margin: 0 8px;
        padding: 6px 14px;
        border-radius: 20px;
        background: #e5e7eb;
        font-size: 14px;
        font-weight: 600;
    }
</style>

<style>
    .spec-section {
        /* padding: 60px 20px; */
        background: #f4f6f8;
        font-family: 'Segoe UI', sans-serif;
        text-align: center;
    }

    .spec-section h2 {
        font-size: 30px;
        margin-bottom: 25px;
    }

    .tabs {
        display: inline-flex;
        background: #e5e7eb;
        padding: 6px;
        border-radius: 50px;
        margin-bottom: 30px;
    }

    .tab-btn {
        border: none;
        background: transparent;
        padding: 12px 30px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 40px;
        transition: 0.3s;
    }

    .tab-btn.active {
        background: #111827;
        color: #fff;
    }

    .tab-panel {
        display: none;
    }

    .tab-panel.active {
        display: block;
    }

    .tab-panel h3 {
        margin-bottom: 20px;
        font-size: 20px;
        color: #111;
    }

    /* Table */
    .table-wrapper {
        max-width: 1200px;
        margin: auto;
        background: #fff;
        border-radius: 12px;
        overflow-x: auto;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        background: #1f2933;
        color: #fff;
    }

    th,
    td {
        padding: 14px 10px;
        border: 1px solid #e5e7eb;
    }

    tbody tr:nth-child(even) {
        background: #f9fafb;
    }
</style>

<style>
    .lms-table-section {
        padding: 60px 20px;
        background: #f4f6f8;
        font-family: 'Segoe UI', sans-serif;
        text-align: center;
    }

    .lms-table-section h2 {
        font-size: 30px;
        margin-bottom: 30px;
        color: #222;
    }

    .table-wrapper {
        max-width: 1200px;
        margin: auto;
        background: #ffffff;
        border-radius: 12px;
        overflow-x: auto;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        margin-bottom: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        background: linear-gradient(135deg, #1f2933, #374151);
        color: #ffffff;
    }

    th,
    td {
        padding: 16px;
        border: 1px solid #e5e7eb;
        font-size: 15px;
        text-align: center;
        vertical-align: middle;
    }

    tbody tr:nth-child(even) {
        background: #f9fafb;
    }

    .image-cell {
        background: #fafafa;
    }

    .image-cell img {
        max-width: 180px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .image-cell img {
            max-width: 120px;
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
                                <h1 class="rs-breadcrumb-title">Conduit & Accessories</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'polycab.php' ?>">Polycab</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'conduit-accessories.php'; ?>">Conduit & Accessories</a></span></li>

                                        <li><span>UPVC Conduit</span></li>
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
                    <h2>Conduit & Accessories</h2>

                </div>

                <section class="products-section">
                    <div class="container">


                        <!-- Products Grid -->

                        <div class="row product-wrapper">
                            <h4 class="text-center mb-4">POLYCAB CONDUITS & ACCESSORIES</h4>
                            <div class="col-12">


                                <div class="card_box">
                                    <div class="row align-items-center product-card">
                                        <p class="text-center">A faithful companion to Polycab wires are the Polycab uPVC conduits and pipes. These are made from the highest grade of waterproof and fire-resistant polymers which are essential for protecting electrical wires and ensuring greater safety to every electrical circuit.</p>
                                        <div class="col-md-6 text-center">
                                            <img src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/conduits_table.png'; ?>"
                                                alt="" class="product-img">
                                            <h3 class="product-title"></h3>
                                        </div>

                                        <div class="col-md-6">
                                            <h3>COLOR</h3>
                                            <p>Polycab Conduits and fitting are available in three different colors.</p>
                                            <h4>BLACK IVORY GREY</h4>
                                        </div>
                                    </div>
                                </div>



                            </div>
                        </div>

                        <section class="table-section">
                            <h2>Dimension Of UPVC Conduit Is : 9537 Part 3</h2>

                            <div class="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th rowspan="2">Normal Size (mm)</th>
                                            <th rowspan="2">Outside Diameter (mm)</th>
                                            <th rowspan="2">Tolerance in OD (mm)</th>
                                            <th colspan="3">Inside Diameter (mm)</th>
                                        </tr>
                                        <tr>
                                            <th>Light</th>
                                            <th>Medium</th>
                                            <th>Heavy</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td>20</td>
                                            <td>20</td>
                                            <td>-0.3</td>
                                            <td>17.4</td>
                                            <td>16.9</td>
                                            <td>15.8</td>
                                        </tr>
                                        <tr>
                                            <td>25</td>
                                            <td>25</td>
                                            <td>-0.4</td>
                                            <td>22.1</td>
                                            <td>21.4</td>
                                            <td>20.6</td>
                                        </tr>
                                        <tr>
                                            <td>32</td>
                                            <td>32</td>
                                            <td>-0.4</td>
                                            <td>28.6</td>
                                            <td>27.8</td>
                                            <td>26.6</td>
                                        </tr>
                                        <tr>
                                            <td>40</td>
                                            <td>40</td>
                                            <td>-0.4</td>
                                            <td>35.8</td>
                                            <td>35.4</td>
                                            <td>35.4</td>
                                        </tr>
                                        <tr>
                                            <td>50</td>
                                            <td>50</td>
                                            <td>-0.5</td>
                                            <td>45.1</td>
                                            <td>44.3</td>
                                            <td>43.2</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>


                        </section>

                        <section class="spec-section">
                            <div class="tabs">
                                <button class="tab-btn active" onclick="openTab(event, 'conduits')">
                                    UPVC CONDUITS COLOR BLACK / IVORY / GREY
                                </button>
                                <button class="tab-btn" onclick="openTab(event, 'fittings')">
                                    UPVC CONDUITS FITTINGS COLOR BLACK / IVORY / GREY
                                </button>
                            </div>

                            <div class="tab-content">

                                <!-- Conduits -->
                                <div id="conduits" class="tab-panel active">

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th></th>
                                                    <th>LMS (Light Mechanical Stress)</th>
                                                    <th></th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>75 × 3 m</td>
                                                    <td rowspan="5" class="image-cell">
                                                        <img src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/1.png'; ?>" alt="LMS UPVC Conduit">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>50 × 3 m</td>
                                                </tr>
                                                <tr>
                                                    <td>32</td>
                                                    <td>25 × 3 m</td>
                                                </tr>
                                                <tr>
                                                    <td>40</td>
                                                    <td>25 × 3 m</td>
                                                </tr>
                                                <tr>
                                                    <td>50</td>
                                                    <td>15 × 3 m</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th></th>
                                                    <th>LMS (Light Mechanical Stress)</th>
                                                    <th></th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>75 × 3 m</td>
                                                    <td rowspan="5" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/2.png'; ?>"
                                                            alt="LMS UPVC Conduit">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>50 × 3 m</td>
                                                </tr>
                                                <tr>
                                                    <td>32</td>
                                                    <td>25 × 3 m</td>
                                                </tr>
                                                <tr>
                                                    <td>40</td>
                                                    <td>25 × 3 m</td>
                                                </tr>
                                                <tr>
                                                    <td>50</td>
                                                    <td>15 × 3 m</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>







                                <!-- Fittings -->
                                <div id="fittings" class="tab-panel">

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>

                                                    <th colspan="4">CIRCULAR BOX TERMINAL (1 WAY)</th>

                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>50</td>
                                                    <td>700</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/3.png'; ?>"
                                                            alt="Circular Box Terminal 1 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>40</td>
                                                    <td>560</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>

                                                    <th colspan="4">SADDLE STARP</th>

                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>300</td>
                                                    <td>5400</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/4.png'; ?>"
                                                            alt="Saddle Starp">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>250</td>
                                                    <td>4500</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>

                                                    <th colspan="4">CIRCULAR BOX - ANGLE 2 WAY</th>

                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>40</td>
                                                    <td>640</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/6.png'; ?>"
                                                            alt="Circular Box Angle 2 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>32</td>
                                                    <td>448</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">COUPLER</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>19</td>
                                                    <td>48</td>
                                                    <td>480</td>
                                                    <td rowspan="6" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/8.png'; ?>"
                                                            alt="Coupler">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>20</td>
                                                    <td>50</td>
                                                    <td>2500</td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>50</td>
                                                    <td>1600</td>
                                                </tr>
                                                <tr>
                                                    <td>32</td>
                                                    <td>24</td>
                                                    <td>240</td>
                                                </tr>
                                                <tr>
                                                    <td>40</td>
                                                    <td>14</td>
                                                    <td>252</td>
                                                </tr>
                                                <tr>
                                                    <td>50</td>
                                                    <td>09</td>
                                                    <td>180</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">CIRCULAR BOX THROUGH 2 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>40</td>
                                                    <td>640</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/5.png'; ?>"
                                                            alt="Circular Box Through 2 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>32</td>
                                                    <td>448</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">CIRCULAR BOX - TEE 3 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>36</td>
                                                    <td>432</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/7.png'; ?>"
                                                            alt="Circular Box Tee 3 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>28</td>
                                                    <td>336</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">REDUCER COUPLER (PIPE TO PIPE)</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>25&gt;20</td>
                                                    <td>70</td>
                                                    <td>1400</td>
                                                    <td rowspan="3" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/9.png'; ?>"
                                                            alt="Reducer Coupler Pipe to Pipe">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>32&gt;20</td>
                                                    <td>70</td>
                                                    <td>840</td>
                                                </tr>
                                                <tr>
                                                    <td>32&gt;25</td>
                                                    <td>70</td>
                                                    <td>840</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">CIRCULAR BOX - INTERSECTION 4 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>36</td>
                                                    <td>432</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/10.png'; ?>"
                                                            alt="Circular Box Intersection 4 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>21</td>
                                                    <td>336</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">SLIP TYPE BEND LONG</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>19</td>
                                                    <td>48</td>
                                                    <td>864</td>
                                                    <td rowspan="6" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/11.png'; ?>"
                                                            alt="Slip Type Bend Long">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>20</td>
                                                    <td>50</td>
                                                    <td>864</td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>50</td>
                                                    <td>432</td>
                                                </tr>
                                                <tr>
                                                    <td>32</td>
                                                    <td>24</td>
                                                    <td>288</td>
                                                </tr>
                                                <tr>
                                                    <td>40</td>
                                                    <td>14</td>
                                                    <td>160</td>
                                                </tr>
                                                <tr>
                                                    <td>50</td>
                                                    <td>09</td>
                                                    <td>75</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">CIRCULAR BOX - U TYPE 2 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>20</td>
                                                    <td>360</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/12.png'; ?>"
                                                            alt="Circular Box U Type 2 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>20</td>
                                                    <td>560</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">CIRCULAR BOX - Y TYPE 3 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>20</td>
                                                    <td>360</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/13.png'; ?>"
                                                            alt="Circular Box Y Type 3 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>20</td>
                                                    <td>360</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">SLIP TYPE BEND NORMAL</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>19</td>
                                                    <td>48</td>
                                                    <td>864</td>
                                                    <td rowspan="3" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/14.png'; ?>"
                                                            alt="Slip Type Bend Normal">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>20</td>
                                                    <td>48</td>
                                                    <td>864</td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>30</td>
                                                    <td>600</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">INSPECTION BEND</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>25</td>
                                                    <td>35</td>
                                                    <td>630</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/15.png'; ?>"
                                                            alt="Inspection Bend">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>25</td>
                                                    <td>375</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">DEEP CIRCULAR BOX - TERMINAL 1 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>20</td>
                                                    <td>280</td>
                                                    <td rowspan="3" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/16.png'; ?>"
                                                            alt="Deep Circular Box - Terminal 1 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>20</td>
                                                    <td>280</td>
                                                </tr>
                                                <tr>
                                                    <td>32</td>
                                                    <td>12</td>
                                                    <td>300</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">ROUND TEE</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>100</td>
                                                    <td>1300</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/17.png'; ?>"
                                                            alt="Round Tee">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>60</td>
                                                    <td>780</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>



                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">INSPECTION TEE</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>35</td>
                                                    <td>700</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/18.png'; ?>"
                                                            alt="Inspection Tee">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>24</td>
                                                    <td>432</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">ROUND ELBOW</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>150</td>
                                                    <td>1800</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/19.png'; ?>"
                                                            alt="ROUND ELBOW">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>100</td>
                                                    <td>1300</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">INSPECTION ELBOW</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>60</td>
                                                    <td>1080</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/20.png'; ?>"
                                                            alt="INSPECTION ELBOW">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>36</td>
                                                    <td>540</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size / Type</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">CIRCULAR LID 65 SCREWS</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>STANDARD</td>
                                                    <td>150</td>
                                                    <td>1950</td>
                                                    <td class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/21.png'; ?>"
                                                            alt="Circular Lid 65 Screws">
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">NON ISI PP CIRCULAR BOX - TERMINAL 1 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>50</td>
                                                    <td>700</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/22.png'; ?>"
                                                            alt="Non ISI PP Circular Box - Terminal 1 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>40</td>
                                                    <td>560</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">CIRCULAR BOX - ANGLE 2 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>40</td>
                                                    <td>640</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/23.png'; ?>"
                                                            alt="Circular Box - Angle 2 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>32</td>
                                                    <td>448</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">FAN BOX STANDARD</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>12</td>
                                                    <td>168</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/24.png'; ?>"
                                                            alt="Fan Box Standard">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>12</td>
                                                    <td>168</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">NON ISI PP CIRCULAR BOX - THROUGH 2 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>40</td>
                                                    <td>640</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/25.png'; ?>"
                                                            alt="Non ISI PP Circular Box - Through 2 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>32</td>
                                                    <td>448</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">FAN BOX STANDARD</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>12</td>
                                                    <td>168</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/26.png'; ?>"
                                                            alt="Fan Box Standard">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>12</td>
                                                    <td>168</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">FAN BOX LARGE</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>8</td>
                                                    <td>168</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/27.png'; ?>"
                                                            alt="Fan Box Small">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>8</td>
                                                    <td>168</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">FAN BOX WITH ROD</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20/25</td>
                                                    <td>91</td>
                                                    <td>91</td>
                                                    <td class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/28.png'; ?>"
                                                            alt="Fan Box With Rod">
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">SPACE BAR SADDLE</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>150</td>
                                                    <td>2550</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/29.png'; ?>"
                                                            alt="Space Bar Saddle">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>150</td>
                                                    <td>2550</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">NON ISI PP CIRCULAR BOX - TEE 3 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>36</td>
                                                    <td>432</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/30.png'; ?>"
                                                            alt="Non ISI PP Circular Box - Tee 3 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>28</td>
                                                    <td>336</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">NON ISI PP CIRCULAR BOX - INSPECTION 4 WAY</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20</td>
                                                    <td>36</td>
                                                    <td>432</td>
                                                    <td rowspan="2" class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/31.png'; ?>"
                                                            alt="Non ISI PP Circular Box - Inspection 4 Way">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>25</td>
                                                    <td>21</td>
                                                    <td>336</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>


                                    <div class="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Size OD (mm)</th>
                                                    <th>Standard Pack</th>
                                                    <th>Transportation Pack</th>
                                                    <th>Product Image</th>
                                                </tr>
                                                <tr>
                                                    <th colspan="4">NON ISI PP CIRCULAR LID WITH SCREW</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>20/25</td>
                                                    <td>150</td>
                                                    <td>1950</td>
                                                    <td class="image-cell">
                                                        <img
                                                            src="<?php echo BASE_URL . 'assets/images/our_products/conduit_accessories/upvc_conduit/32.png'; ?>"
                                                            alt="Non ISI PP Circular Lid With Screw">
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>





















                                </div>

                            </div>
                        </section>







                    </div>
                </section>



        </section>



    </main>
    <!-- Body main wrapper end -->

    <?php include ROOT_PATH . '/common/footer.php'; ?>

    <?php include ROOT_PATH . '/common/scripts.php'; ?>


</body>


</html>