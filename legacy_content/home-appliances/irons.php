<?php include '../config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Irons - Mohit Sales Corporation Pvt. Ltd.</title>
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
        /* height: 280px; */
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
                                <h1 class="rs-breadcrumb-title">Home Appliances</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'polycab.php' ?>">Polycab</a></span></li>
                                        <li><span><a href="<?php echo BASE_URL . 'home-appliances.php' ?>">Home Appliances</a></span></li>
                                        <li><span>Irons</span></li>
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
                    <h2>Irons</h2>

                </div>

                <section class="products-section">
                    <div class="container">

                        <!-- Section Title -->


                        <!-- Products Grid -->
                        <div class="products-grid">

                           <div class="product-card">
                                <a href="<?php echo BASE_URL . 'home-appliances/irons/steam-iron.php'; ?>">
                                    <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/iron/steam-iron.png'?>" alt="Product">
                                    <h3>Steam Iron</h3>
                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>
                            </div>

                            <div class="product-card">
                                <a href="<?php echo BASE_URL . 'home-appliances/irons/dry-iron.php'; ?>">
                                    <img src="<?php echo BASE_URL . 'assets/images/our_products/home_appliances/iron/dry-iron.png'?>" alt="Product">
                                    <h3>Dry Iron</h3>

                                    <div class="pricelist-button">
                                        <span class="pricelist-btn">Explore More</span>
                                    </div>
                                </a>
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