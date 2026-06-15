<?php include 'config.php'; ?>


<!doctype html>
<html lang="en-US">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Resources - Mohit Sales Corporation Pvt. Ltd.</title>
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
                data-background="<?php echo BASE_URL . 'assets/images/inner-banner/about-us.png'; ?>"></div>
            <div class="container">
                <div class="row">
                    <div class="col-xxl-12 col-xl-12 col-lg-12">
                        <div class="rs-breadcrumb-content-wrapper">
                            <div class="rs-breadcrumb-title-wrapper">
                                <h1 class="rs-breadcrumb-title">Resources</h1>
                            </div>
                            <div class="rs-breadcrumb-menu">
                                <nav>
                                    <ul>
                                        <li><span><a href="<?php echo BASE_URL . 'index.php' ?>">Home</a></span></li>
                                        <li><span>Resources</span></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- breadcrumb area end -->

        <section classs="resources_sec">
            <div class="container pricelist">
                    <div class="row">
                        <div class="col-lg-4">
                            <a
                                href="<?php echo BASE_URL . 'assets/images/resources/prabhat-wires-ak-pvt-ltd-company-profile.pdf' ; ?>">
                                <div class="resources-card">
                                    <a
                                        href="<?php echo BASE_URL . 'assets/images/resources/prabhat-wires-ak-pvt-ltd-company-profile.pdf' ; ?>">
                                        <h4>Company Profile</h4>
                                    </a>
                                </div>
                            </a>
                        </div>
                        
                    </div>
                
                </div>
            </div>
        </section>
        
         <section classs="resources_sec">
            <div class="container catalogue">
                <div class="row d-flex justify-content-center"">
                    <div class="col-lg-4">
                        <div class="catalogue-card">
                    
                             <a href="assets/images/catalogue/Cable Laying catalogue_Ord 17709.pdf" target="_blank">
                                <div class="catalogue-icon-box">
                                    <i class="fa-solid fa-file-pdf"></i>
                                </div>
                            </a>
                    
                            <div class="catalogue-content">
                                <h3>Cable Laying Catalogue</h3>
                                <a href="assets/images/catalogue/Cable Laying catalogue_Ord 17709.pdf" class="catalogue-btn" target="_blank">View Catalogue</a>
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