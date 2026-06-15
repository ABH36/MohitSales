<?php include 'config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Certificates - Mohit Sales Corporation Pvt. Ltd.</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css" />

    <?php include ROOT_PATH . '/common/links.php'; ?>

</head>

<body class="rs-smoother-yes rtl">

    <?php include ROOT_PATH . '/common/header.php'; ?>

    <!-- Body main wrapper start -->
    <main>

        <!-- breadcrumb area start -->
        <section class="rs-breadcrumb-area rs-breadcrumb-one p-relative">
            <div class="rs-breadcrumb-bg"
                data-background="<?php echo BASE_URL . 'assets/images/inner-banner/achievement.png'; ?>"></div>
            <div class="container">
                <div class="row">
                    <div class="col-xxl-12 col-xl-12 col-lg-12">
                        <div class="rs-breadcrumb-content-wrapper">
                            <div class="rs-breadcrumb-title-wrapper">
                                <h1 class="rs-breadcrumb-title">Certificates</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span>Certificates</span></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- breadcrumb area end -->

        <section class="certificate-inner new">
            <div class="container">
                <div class="certificate-heading">
                    <h4>Our Certifications</h4>
                </div>
                <div class="row">
                    <div class="col-lg-6">
                        <div class="certificate-heading">
                            <!-- <h4>Mohit Sales Corporation Pvt. Ltd.</h4>
                            <div class="separator1"></div> -->
                        </div>
                        <div class="certificate-card">
                            <div class="certificate-img">
                                <a href="<?php echo BASE_URL . 'assets/images/certificate/certificate-of-authorisationllp-fy25-26.png'; ?>"
                                    data-fancybox="gallery" data-caption="Mohit Sales Corporation Pvt. Ltd."> <img
                                        src="<?php echo BASE_URL . 'assets/images/certificate/certificate-of-authorisationllp-fy25-26.png'; ?>"
                                        alt="certificate-one" /></a>
                            </div>
                            <div class="certificate-title">
                                <h6>Mohit Sales Corporation Pvt. Ltd.</h6>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="certificate-heading">
                            <!-- <h4>Mohit Sales Corporation Pvt. Ltd. AK Private Limited</h4>
                            <div class="separator1"></div> -->
                        </div>
                        <div class="certificate-card">
                            <div class="certificate-img">
                                <a href="<?php echo BASE_URL . 'assets/images/certificate/certificate-of-authorisation-ak-pvt-ltd.png'; ?>"
                                    data-fancybox="gallery" data-caption="Mohit Sales Corporation Pvt. Ltd. AK Private Limited"> <img
                                        src="<?php echo BASE_URL . 'assets/images/certificate/certificate-of-authorisation-ak-pvt-ltd.png'; ?>"
                                        alt="certificate-one" /></a>
                            </div>
                            <div class="certificate-title">
                                <h6>Mohit Sales Corporation Pvt. Ltd. AK Private Limited</h6>
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


<script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js"></script>
<script>
Fancybox.bind('[data-fancybox="gallery"]', {
    Thumbs: {
        type: "classic"
    }
});
</script>


</html>