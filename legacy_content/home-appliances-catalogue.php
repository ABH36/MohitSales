<?php include 'config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Mohit Sales Corporation Pvt. Ltd.</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <?php include ROOT_PATH . '/common/links.php'; ?>

</head>

<body class="rs-smoother-yes rtl">

    <?php include ROOT_PATH . '/common/header.php'; ?>

    <!-- Body main wrapper start -->
    <main>

        <!-- breadcrumb area start -->
        <section class="rs-breadcrumb-area rs-breadcrumb-one p-relative">
            <div class="rs-breadcrumb-bg"
                data-background="<?php echo BASE_URL . 'assets/images/inner-banner/pricelist.png'; ?>"></div>
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
                                        <li><span><a href="catalogue.php">Catalogue</a></span></li>
                                        <li><span>Home Appliances Catalogue</span></li>
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
                    <h2>Home Appliances</h2>

                </div>

                <div class="row g-5">

                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <div class="catalogue-card">
                            <a href="assets/images/catalogue/home_appliances_catalogue/pdf/Water-Heater-Brochure-2023.pdf" class="catalogue-link" target="_blank">
                                <div class="catalogue-img">
                                    <img src="assets/images/catalogue/home_appliances_catalogue/water_heater.png" alt="Water Heaters">
                                </div>
                                <div class="catalogue-content">
                                    <h3>Water Heaters</h3>
                                    <p>Appliances</p>
                                    <span class="view-btn">View Catalogue</span>
                                </div>
                            </a>
                        </div>
                    </div>

                     <div class="col-lg-3 col-md-4 col-sm-6">
                        <div class="catalogue-card">
                            <a href="assets/images/catalogue/home_appliances_catalogue/pdf/Polycab-Cooler-Catalogue_2020.pdf" class="catalogue-link" target="_blank">
                                <div class="catalogue-img">
                                    <img src="assets/images/catalogue/home_appliances_catalogue/coolers.jpg" alt="Coolers">
                                </div>
                                <div class="catalogue-content">
                                    <h3>Coolers</h3>
                                    <p>Appliances</p>
                                    <span class="view-btn">View Catalogue</span>
                                </div>
                            </a>
                        </div>
                    </div>

                     <div class="col-lg-3 col-md-4 col-sm-6">
                        <div class="catalogue-card">
                            <a href="assets/images/catalogue/home_appliances_catalogue/pdf/Polycab-Iron-Catalogue_2020.pdf" class="catalogue-link" target="_blank">
                                <div class="catalogue-img">
                                    <img src="assets/images/catalogue/home_appliances_catalogue/iron.png" alt="Irons">
                                </div>
                                <div class="catalogue-content">
                                    <h3>Irons</h3>
                                    <p>Appliances</p>
                                    <span class="view-btn">View Catalogue</span>
                                </div>
                            </a>
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