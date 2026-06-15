<?php include 'config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Pricelist - Mohit Sales Corporation Pvt. Ltd.</title>
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
                                <h1 class="rs-breadcrumb-title">Pricelist</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span>Pricelist</span></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- breadcrumb area end -->

        <!-- <section classs="pricelist-inner">
            <div class="container pricelist">
                <div class="row">
                    <div class="col-lg-4">
                        <div class="pricelist-card">
                            <div class="pricelist-image">
                                <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>">
                            </div>
                            <div class="pricelist-title">
                                <p>Polycab Wires and Cables</p>
                            </div>
                            <div class="pricelist-button">
                                <a href="<?php echo BASE_URL . 'assets/images/pricelist/Mohit Sales Corporation Pvt. Ltd. FLEXIBLE DT 6th JANUARY 2026 .pdf'; ?>"
                                    class="pricelist-btn">Download</a>
                            </div>
                        </div>
                    </div>



                </div>
            </div>
        </section> -->

        <section class="pricelist-inner">
            <div class="container pricelist">

                <!-- Tabs -->
                <ul class="pricelist-tabs">
                    <li class="active" data-tab="polycab">Polycab</li>
                    <li data-tab="dowells">Dowells</li>
                </ul>

                <!-- Tab Content -->
                <div class="pricelist-tab-content">

                    <!-- Polycab -->
                    <div class="tab-pane active" id="polycab">
                        <div class="row">
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Polycab">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Cables</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Polycab">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Switchgears</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Polycab">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Fans</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Polycab">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Solar</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Polycab">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Conduit & Appliances</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Polycab">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Home Appliances</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Dowells -->
                    <div class="tab-pane" id="dowells">
                        <div class="row">
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Dowells">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Cable Terminal</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Dowells">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Gland</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 col-md-6 mb-4">
                                <div class="pricelist-card">
                                    <div class="pricelist-image">
                                        <img src="<?php echo BASE_URL . 'assets/images/pricelist/pricelist_logo.png'; ?>" alt="Dowells">
                                    </div>
                                    <div class="pricelist-title">
                                        <p>Crimping Tool</p>
                                    </div>
                                    <div class="pricelist-button">
                                        <a href="#"
                                            class="pricelist-btn">Download</a>
                                    </div>
                                </div>
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