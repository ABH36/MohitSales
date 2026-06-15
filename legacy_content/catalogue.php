<?php include 'config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Catalogue - Mohit Sales Corporation Pvt. Ltd.</title>
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
                data-background="<?php echo BASE_URL . 'assets/images/inner-banner/catalogue.png'; ?>"></div>
            <div class="container">
                <div class="row">
                    <div class="col-xxl-12 col-xl-12 col-lg-12">
                        <div class="rs-breadcrumb-content-wrapper">
                            <div class="rs-breadcrumb-title-wrapper">
                                <h1 class="rs-breadcrumb-title">Catalogue</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span>Catalogue</span></li>
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
            <h2>Product Catalogue</h2>
            <p>Explore our wide range of electrical products across trusted categories</p>
        </div>

        <div class="row">

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="cables-catalogue.php" class="catalogue-card">
                    <img src="assets/images/catalogue/cables.png" alt="Cables">
                    <h5>Cables</h5>
                </a>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="switchgear-catalogue.php" class="catalogue-card">
                    <img src="assets/images/catalogue/switchgear.png" alt="Switchgears">
                    <h5>Switchgears</h5>
                </a>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="fans-catalogue.php" class="catalogue-card">
                    <img src="assets/images/catalogue/fans.png" alt="Fans">
                    <h5>Fans</h5>
                </a>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="solar-catalogue.php" class="catalogue-card">
                    <img src="assets/images/catalogue/solar.png" alt="Solar">
                    <h5>Solar</h5>
                </a>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="conduit-catalogue.php" class="catalogue-card">
                    <img src="assets/images/catalogue/conduit.png" alt="Conduit & Accessories">
                    <h5>Conduit & Accessories</h5>
                </a>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="home-appliances-catalogue.php" class="catalogue-card">
                    <img src="assets/images/catalogue/home-appliances.png" alt="Home Appliances">
                    <h5>Home Appliances</h5>
                </a>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="#" class="catalogue-card">
                    <img src="assets/images/catalogue/cable-terminal.png" alt="Cable Terminal">
                    <h5>Cable Terminal</h5>
                </a>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="#" class="catalogue-card">
                    <img src="assets/images/catalogue/gland.png" alt="Gland">
                    <h5>Gland</h5>
                </a>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="#" class="catalogue-card">
                    <img src="assets/images/catalogue/crimping-tool.png" alt="Crimping Tool">
                    <h5>Crimping Tool</h5>
                </a>
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