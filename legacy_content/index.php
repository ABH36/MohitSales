<?php include 'config.php'; ?>
<?php

session_start();

$_SESSION['captcha'] = strval(rand(1000, 9999));
?>
<!doctype html>
<html lang="en-US">


<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Mohit Sales Corporation Pvt. Ltd. </title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <?php include ROOT_PATH . '/common/links.php'; ?>


    <link href="
https://cdn.jsdelivr.net/npm/sweetalert2@11.15.10/dist/sweetalert2.min.css
" rel="stylesheet">


</head>

<style>
    .captcha-box {
        display: inline-block;
        padding: 10px 16px;
        background: #fff;
        border: 2px dashed #ccc;
        font-weight: 700;
        letter-spacing: 4px;
        font-size: 18px;
    }

    .captcha-refresh {
        cursor: pointer;
        color: #fff;
        margin-left: 8px;
        text-decoration: underline;
        font-size: 14px;
    }
</style>



<body class="rs-smoother-yes rtl">


    <?php include ROOT_PATH . '/common/header-index.php'; ?>


    <main>

        <!-- banner area start -->
        <section class="rs-banner-area rs-banner-nine rs-swiper banner_sec d-none">
            <div class="rs-banner-slider-wrapper">
                <div class="banner-swiper" data-clone-slides="false" data-loop="true" data-speed="2000"
                    data-autoplay="true" data-dots-dynamic="false" data-hover-pause="true" data-effect="fade"
                    data-delay="3000" data-item="1" data-margin="30">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide">
                            <div class="rs-banner-item-wrapper">
                                <div class="rs-banner-bg-thumb"
                                    data-background="assets/images/banner/polycab-cables.png">
                                </div>
                                <div class="container">
                                    <div class="row justify-content-center">
                                        <div class="col-xxl-8 col-xl-9 col-lg-10 col-md-10">
                                            <div class="rs-banner-wrapper">

                                                <div class="rs-banner-content">
                                                    <h1 class="rs-banner-title">
                                                    </h1>
                                                    <div class="rs-banner-descrip">
                                                        <p> </p>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- <div class="swiper-slide">
                            <div class="rs-banner-item-wrapper">
                                <div class="rs-banner-bg-thumb" data-background="assets/images/bg/banner-bg-15.png">
                                </div>
                                <div class="container">
                                    <div class="row justify-content-center">
                                        <div class="col-xxl-8 col-xl-9 col-lg-10 col-md-10">
                                            <div class="rs-banner-wrapper">

                                                <div class="rs-banner-content">
                                                    <h1 class="rs-banner-title">
                                                    </h1>
                                                    <div class="rs-banner-descrip">
                                                        <p> </p>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> -->
                    </div>
                    <!-- If we need navigation buttons -->
                    <!-- <div class="rs-banner-navigation">
                        <button class="swiper-button-prev rs-swiper-btn has-light-orange"><i
                                class="fa-regular fa-arrow-left"></i></button>
                        <button class="swiper-button-next rs-swiper-btn has-light-orange"><i
                                class="fa-regular fa-arrow-right"></i></button>
                    </div> -->
                    <!-- if we need pagination -->
                    <div class="rs-banner-pagination d-block">
                        <div class="swiper-pagination"></div>

                    </div>

                </div>
            </div>
        </section>
        <!-- banner area end -->

        <section class="banner_sec desktop">
            <div class="swiper banner-swiper">
                <div class="swiper-wrapper">
                      <div class="swiper-slide"
                        style="background-image: url('assets/images/banner/desktop/cable.png');"
                        onclick="window.location.href='<?php echo BASE_URL . 'index.php'; ?>';">
                    </div>
                    <div class="swiper-slide" style="background-image: url('assets/images/banner/desktop/polycab.png');"
                        onclick="window.location.href='<?php echo BASE_URL . 'index.php'; ?>';">
                    </div>

                    <div class="swiper-slide"
                        style="background-image: url('assets/images/banner/desktop/fans.png');"
                        onclick="window.location.href='<?php echo BASE_URL . 'index.php'; ?>';">
                    </div>
                    <div class="swiper-slide"
                        style="background-image: url('assets/images/banner/desktop/solar_product.png');"
                        onclick="window.location.href='<?php echo BASE_URL . 'index.php'; ?>';">
                    </div>
                    <div class="swiper-slide"
                        style="background-image: url('assets/images/banner/desktop/switchgear.png');"
                        onclick="window.location.href='<?php echo BASE_URL . 'index.php'; ?>';">
                    </div>
                    <div class="swiper-slide"
                        style="background-image: url('assets/images/banner/desktop/wire.png');"
                        onclick="window.location.href='<?php echo BASE_URL . 'index.php'; ?>';">
                    </div>
                    <div class="swiper-slide"
                        style="background-image: url('assets/images/banner/desktop/dowells.png');"
                        onclick="window.location.href='<?php echo BASE_URL . 'index.php'; ?>';">
                    </div>
                    <!-- <div class="swiper-slide" style="background-image: url('assets/images/banner/banner-four.png');">
                    </div> -->
                </div>

                <div class="swiper-pagination"></div>
                <!-- <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div> -->
            </div>
        </section>




        <section class="banner_sec mobile">
            <div class="swiper banner-swiper">
                <div class="swiper-wrapper">
                    <div class="swiper-slide"
                        style="background-image: url('assets/images/banner/mobile/cable.png');">
                    </div>
                    <div class="swiper-slide" style="background-image: url('assets/images/banner/mobile/polycab_banner.png');">
                    </div>
                    <div class="swiper-slide" style="background-image: url('assets/images/banner/mobile/fans.png');">
                    </div>
                    
                    <div class="swiper-slide"
                        style="background-image: url('assets/images/banner/mobile/solar_product.png');">
                    </div>
                    <div class="swiper-slide" style="background-image: url('assets/images/banner/mobile/switchgear.png');">
                    </div>
                    <div class="swiper-slide" style="background-image: url('assets/images/banner/mobile/wire.png');">
                    </div>
                    <div class="swiper-slide" style="background-image: url('assets/images/banner/mobile/dowells.png');">
                    </div>
                </div>

                <div class="swiper-pagination"></div>
                <!-- <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div> -->
            </div>
        </section>


        <section class="rs-about-area section-space rs-about-nine about_us">
            <div class="container">
                <!-- <div class="row  g-5 section-title-space justify-content-center">
                    <div class="col-xl-12 col-lg-12">
                        <div class="rs-section-title-wrapper text-center">
                            <span class="rs-section-subtitle has-theme-orange">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15"
                                    fill="none">
                                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                        fill="#1E2E5E"></path>
                                </svg>
                                About Us
                            </span>

                            <p class="descrip mt-3">At Mohit Sales Corporation Pvt. Ltd. and Mohit Sales Corporation Pvt. Ltd. AK Pvt. Ltd., we go beyond
                                just delivering wires and cables — we provide reliability, service, and long-lasting
                                connections. With decades of industry experience, a deep-rooted commitment to quality,
                                and partnerships with top brands like Polycab India Ltd., we’re here to power progress —
                                safely, smartly, and sustainably.
                            </p>
                        </div>
                    </div>
                </div> -->
                <!-- <div class="row company-name">
                    <h4 class="meet">MEET OUR COMPANIES</h4>
                    <p>At Mohit Sales Corporation Pvt. Ltd., we do more than supply cables — we create connections that power lives,
                        businesses, and progress. With a strong legacy and a bold vision, we’ve built a brand that
                        stands for safety, strength, and smart solutions. Today, we proudly operate through two
                        specialized companies — one rooted in experience, the other built for the future.</p>
                    <div class="col-lg-5">
                        <div class="company-card">
                            <div class="company-logo">
                                <img src="assets/images/about/about-logo/prbhat-wires-llp-logo.png" />

                            </div>
                            <h2>Mohit Sales Corporation Pvt. Ltd.</h2>
                            <p>Buy <span>Polycab</span>, Buy <span>Safety</span></p>
                            <h6>Bharosa jo saalon se bana hain</h6>
                            <p>Since 2018</p>

                            <div class="contact-btn">
                                <div class="rs-banner-btn">
                                    <a class="rs-btn has-theme-orange has-icon has-bg"
                                        href="<?php echo BASE_URL . 'about-us.php#prabhat-wire-llp'; ?>">Read More
                                        <span class="icon-box">
                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 32 32">
                                                <path
                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                </path>
                                            </svg>
                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 32 32">
                                                <path
                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                </path>
                                            </svg>
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-5">
                        <div class="company-card">
                            <div class="company-logo ak">
                                <img src="assets/images/about/about-logo/prabhat-wires-ak-pvt-ltd-logo.png" />

                            </div>
                            <h2 class="ak">Mohit Sales Corporation Pvt. Ltd. AK<span class="below">Private Limited</span></h2>
                            <p> <span>Wires That Spark Innovation</span></p>
                            <h6>Nayi soch, nayi raftaar</h6>
                            <p>Established in 2025</p>
                            <div class="contact-btn">
                                <div class="rs-banner-btn">
                                    <a class="rs-btn has-theme-orange has-icon has-bg"
                                        href="<?php echo BASE_URL . 'about-us.php#prabhat-wires-ak'; ?>">Read More
                                        <span class="icon-box">
                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 32 32">
                                                <path
                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                </path>
                                            </svg>
                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 32 32">
                                                <path
                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                </path>
                                            </svg>
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> -->

            </div>
        </section>

        <!-- <section class="image-box-section about-us">

            <div class="container">

                <div class="row">

                    <div class="col-xl-6 col-lg-12 mb-5 mb-lg-5 mb-xl-0">

                        <div class="image_boxes style_three">

                            <img src="assets/images/about/authorized distributor.png" alt="image" class="img-fluid">

                        </div>

                    </div>

                    <div class="col-xl-6 col-lg-12">

                        <div class="title_all_box style_one dark_color">

                            <div class="title_sections">

                                <div class="about-heading">
                                    <h2>About Us</h2>
                                </div>

                                <h3>Mohit Sales Corporation Pvt. Ltd. </h3>

                                <p>Founded in <strong> 1997, </strong> Mohit Sales Corporation Pvt. Ltd. has grown into a trusted and leading name in the electrical distribution industry. With <strong> 27+ years of experience, </strong> we specialize in delivering high-quality electrical products and solutions across multiple sectors.</p>

                                <p> As an <strong> Authorised Distributor of Polycab and Dowells </strong> we ensure our customers receive genuine products backed by technical expertise, timely supply, and reliable after-sales support. Our strong industry presence, expert team, and customer-centric approach have enabled us to consistently meet the evolving needs of contractors, industries, retailers, and infrastructure projects.
                                </p>
                            </div>

                        </div>

                    </div>

                    
                </div>

            </div>

        </section> -->
        <section class="image-box-section about-us">

            <div class="container">

                <div class="row align-items-center">

                    <div class="col-xl-6 col-lg-12 mb-5 mb-xl-0">
                        <div class="image_boxes style_three position-relative">
                            <img src="assets/images/about/authorized distributor.png"
                                alt="Authorized Distributor of Polycab and Dowells"
                                class="img-fluid rounded shadow">
                        </div>
                    </div>

                    <div class="col-xl-6 col-lg-12">

                        <div class="title_all_box style_one dark_color">

                            <div class="title_sections">

                                <div class="about-heading mb-2">
                                    <h2>About Us</h2>
                                </div>

                                <h4 class="mb-3">Mohit Sales Corporation Pvt. Ltd.</h4>

                                <p>
                                    Established in <strong>1997</strong>, <strong>Mohit Sales Corporation Pvt. Ltd.</strong> has built a strong reputation as a trusted leader in the electrical distribution industry. With over <strong>27+ years of experience</strong>, we deliver reliable, high-quality electrical products and customized solutions to diverse sectors.
                                </p>

                                <p>
                                    We are a proud <strong>Authorised Distributor of Polycab and Dowells</strong>, ensuring our customers receive only genuine, certified products that meet the highest industry standards.
                                </p>

                                <p>
                                    Our success is driven by a customer-first approach, technical expertise, timely delivery, and dependable after-sales support. Today, we proudly serve <strong>contractors, industries, retailers, and large-scale infrastructure projects</strong>, helping power growth and innovation across the region.
                                </p>

                                <!-- Optional Highlight Points -->
                                <!-- <ul class="list-unstyled mt-4">
                            <li>✔ 27+ Years of Industry Excellence</li>
                            <li>✔ Authorized Distributor – Polycab & Dowells</li>
                            <li>✔ Reliable Supply & Technical Support</li>
                            <li>✔ Trusted by Leading Contractors & Industries</li>
                        </ul> -->

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>

        <!-- about area end -->

        <section class="rs-why-choose-area rs-why-choose-three wcu_sec">
            <span class="rs-why-choose-shape gsap-move down-200 start-61"
                style="transform: translate3d(0px, 34.4528px, 0px);"></span>
            <div class="rs-why-choose-bg-thumb" data-background="assets/images/bg/background.png"
                style="background-image: url(&quot;assets/images/bg/background.png&quot;);"></div>
            <div class="container">
                <div class="row">
                    <div class="col-xl-7 col-lg-6 col-md-10">
                        <div class="rs-why-choose-content-wrapper section-space">
                            <div class="rs-section-title-wrapper section-title-space">
                                <span class="justify-content-start rs-section-subtitle has-stroke">
                                    Why Choose Us
                                </span>
                                <h2 class="rs-section-title rs-split-text-enable split-in-fade"
                                    style="perspective: 400px;">
                                    Empowering Projects, Ensuring Reliability
                                </h2>
                            </div>
                            <div class="rs-why-choose-content-inner">
                                <div class="rs-why-choose-content-item wow fadeInUp" data-wow-delay=".3s"
                                    data-wow-duration="1s"
                                    style="visibility: visible; animation-duration: 1s; animation-delay: 0.3s; animation-name: fadeInUp;">
                                    <div class="rs-why-choose-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="39"
                                            viewBox="0 0 52 39" fill="none">
                                            <path
                                                d="M47.7749 4.22461C47.7749 5.91816 46.7266 5.91816 46.7266 7.69235C46.7266 9.3859 47.7749 9.3859 47.7749 11.1601C47.7749 12.8536 46.7266 12.8536 46.7266 14.6278C46.7266 16.3214 47.7749 16.3214 47.7749 18.0956C47.7749 19.7891 46.7266 19.7891 46.7266 21.5633C46.7266 23.2569 47.7749 23.2569 47.7749 25.0311C47.7749 26.7246 46.7266 26.7246 46.7266 28.4988C46.7266 30.1923 47.7749 30.1924 47.7749 31.9665"
                                                stroke="white" stroke-width="1.7" stroke-miterlimit="10"
                                                stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path
                                                d="M26.0003 29.7916C30.3206 29.7916 33.8229 26.2894 33.8229 21.9691C33.8229 17.6488 30.3206 14.1465 26.0003 14.1465C21.68 14.1465 18.1777 17.6488 18.1777 21.9691C18.1777 26.2894 21.68 29.7916 26.0003 29.7916Z"
                                                stroke="white" stroke-width="1.7" stroke-miterlimit="10"
                                                stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path
                                                d="M30.3542 28.4199V38.0973L25.9994 34.4683L21.6445 38.0973V28.4199C22.9349 29.307 24.3865 29.7909 25.9994 29.7909C27.6123 29.7909 29.1445 29.307 30.3542 28.4199Z"
                                                stroke="white" stroke-width="1.7" stroke-miterlimit="10"
                                                stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path
                                                d="M26.0014 16.8086L27.5336 19.8731L30.9207 20.357L28.5014 22.7763L29.0659 26.2441L26.0014 24.6312L22.9369 26.2441L23.5014 22.7763L21.082 20.357L24.4691 19.8731L26.0014 16.8086Z"
                                                stroke="white" stroke-width="1.7" stroke-miterlimit="10"
                                                stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M18.4194 35.0323H1V1H51V35.0323H33.5806" stroke="white"
                                                stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round"
                                                stroke-linejoin="round"></path>
                                            <path
                                                d="M4.22656 4.22461C5.75882 4.22461 5.75882 5.273 7.37172 5.273C8.90398 5.273 8.90398 4.22461 10.5169 4.22461C12.0491 4.22461 12.0491 5.273 13.662 5.273C15.1943 5.273 15.1943 4.22461 16.8072 4.22461C18.3395 4.22461 18.3395 5.273 19.9524 5.273C21.4846 5.273 21.4846 4.22461 23.0975 4.22461C24.6298 4.22461 24.6298 5.273 26.2427 5.273C27.7749 5.273 27.7749 4.22461 29.3879 4.22461C30.9201 4.22461 30.9201 5.273 32.533 5.273C34.0653 5.273 34.0653 4.22461 35.6782 4.22461C37.2104 4.22461 37.2104 5.273 38.8233 5.273C40.4362 5.273 40.3556 4.22461 41.9685 4.22461C43.5008 4.22461 43.5008 5.273 45.1137 5.273C46.6459 5.273 46.6459 4.22461 48.2588 4.22461"
                                                stroke="white" stroke-width="1.7" stroke-miterlimit="10"
                                                stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path
                                                d="M4.22656 4.22461C4.22656 5.91816 5.27495 5.91816 5.27495 7.69235C5.27495 9.3859 4.22656 9.3859 4.22656 11.1601C4.22656 12.8536 5.27495 12.8536 5.27495 14.6278C5.27495 16.3214 4.22656 16.3214 4.22656 18.0149C4.22656 19.7085 5.27495 19.7085 5.27495 21.4827C5.27495 23.1762 4.22656 23.1762 4.22656 24.9504C4.22656 26.644 5.27495 26.644 5.27495 28.4182C5.27495 30.1117 4.22656 30.1117 4.22656 31.8859"
                                                stroke="white" stroke-width="1.7" stroke-miterlimit="10"
                                                stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path
                                                d="M33.582 31.1613C34.0659 31.4839 34.3885 31.8064 35.2756 31.8064C36.8078 31.8064 36.8078 30.7581 38.4207 30.7581C40.0336 30.7581 39.953 31.8064 41.5659 31.8064C43.1788 31.8064 43.0982 30.7581 44.7111 30.7581C46.2433 30.7581 46.2433 31.8064 47.8562 31.8064"
                                                stroke="white" stroke-width="1.7" stroke-miterlimit="10"
                                                stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path
                                                d="M4.22656 31.8062C5.75882 31.8062 5.75882 30.7578 7.37172 30.7578C8.98463 30.7578 8.90398 31.8062 10.5169 31.8062C12.1298 31.8062 12.0491 30.7578 13.662 30.7578C15.275 30.7578 15.1943 31.8062 16.8072 31.8062C17.6943 31.8062 18.0975 31.4836 18.5008 31.161"
                                                stroke="white" stroke-width="1.7" stroke-miterlimit="10"
                                                stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M10.2754 9.95117H41.727" stroke="white" stroke-width="1.7"
                                                stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round">
                                            </path>
                                            <path d="M41.7259 12.8535H32.3711" stroke="white" stroke-width="1.7"
                                                stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round">
                                            </path>
                                            <path d="M19.6302 12.8535H10.2754" stroke="white" stroke-width="1.7"
                                                stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round">
                                            </path>
                                            <path d="M39.0663 15.8379H35.1953" stroke="white" stroke-width="1.7"
                                                stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round">
                                            </path>
                                            <path d="M16.8065 15.8379H12.9355" stroke="white" stroke-width="1.7"
                                                stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round">
                                            </path>
                                        </svg>
                                    </div>
                                    <div class="rs-why-choose-content">
                                        <h6 class="rs-why-choose-title">Trusted Authorised Brands</h6>
                                        <p class="descrip">
                                            We supply only genuine products from authorised brands like Polycab and Dowells, ensuring reliability and long-term performance.
                                        </p>
                                    </div>
                                </div>
                                <div class="rs-why-choose-content-item wow fadeInUp" data-wow-delay=".5s"
                                    data-wow-duration="1s"
                                    style="visibility: visible; animation-duration: 1s; animation-delay: 0.5s; animation-name: fadeInUp;">
                                    <div class="rs-why-choose-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="44"
                                            viewBox="0 0 52 44" fill="none">
                                            <path
                                                d="M1 35.972L11.8434 42.8999H41.6627L51 35.9721M1 35.972V29.6468L3.71084 28.442M1 35.972C2.13109 35.7807 3.23424 35.6004 4.31325 35.4312M51 35.9721V30.5504C50.367 28.7154 49.5632 28.2966 47.3855 28.442M51 35.9721C49.7161 35.7685 48.5209 35.5779 47.3855 35.4002M3.71084 28.442L4.31325 35.4312M3.71084 28.442C3.71295 17.0045 6.19652 11.6895 14.5542 6.45407L14.5643 6.75527M4.31325 35.4312C7.72785 34.8957 10.9007 34.4713 13.9518 34.1606M14.8554 15.4902C14.332 16.2806 14.1829 16.7992 14.253 17.8999L13.9518 34.1606M14.8554 15.4902C16.2976 13.0882 17.5835 11.4975 19.0723 10.4783M14.8554 15.4902L14.5643 6.75527M13.9518 34.1606C21.9015 33.3511 29.0249 33.3131 37.4458 34.0922M37.4458 34.0922C37.3505 27.4542 37.6415 23.4852 36.8081 17.2974M37.4458 34.0922C40.7709 34.3998 43.7753 34.8349 47.3855 35.4002M36.8081 17.2974C36.7298 16.716 36.6416 16.1149 36.5422 15.4902C35.2686 13.357 34.0887 11.8955 32.6265 10.8879M36.8081 17.2974V6.15284M32.6265 3.44202C32.8186 2.38671 34.1325 1.93599 34.4337 1.93599C34.7349 1.93599 36.3427 2.40407 36.8081 3.44202V6.15284M32.6265 3.44202V10.8879M32.6265 3.44202H29.012M32.6265 10.8879C31.603 10.1826 30.4411 9.69973 29.012 9.36462M29.012 3.44202V9.36462M29.012 3.44202C28.6022 1.27565 27.7684 0.898007 25.6988 1.03238C23.8847 0.867197 23.1108 1.28444 22.3855 3.44202V9.13869M29.012 9.36462C28.0437 9.13755 26.9527 8.97833 25.6988 8.86371C24.4485 8.86923 23.36 8.95033 22.3855 9.13869M22.3855 9.13869C21.1242 9.38253 20.0541 9.80613 19.0723 10.4783M22.0843 3.44202C20.7961 3.16488 20.1168 3.24563 19.0723 4.34563M19.0723 4.34563V10.4783M19.0723 4.34563C18.496 2.93306 17.9234 2.55188 16.6627 2.2372C15.1406 2.94065 14.8086 3.42516 14.5542 4.34563L14.5643 6.75527M47.3855 28.442V35.4002M47.3855 28.442V20.9119C45.6681 14.2309 44.1887 10.6804 36.8081 6.15284M17.2651 22.1167V31.454"
                                                stroke="white" stroke-width="2"></path>
                                        </svg>
                                    </div>
                                    <div class="rs-why-choose-content">
                                        <h6 class="rs-why-choose-title">Expert Technical Support</h6>
                                        <p class="descrip">
                                            Our experienced team provides technical guidance and product recommendations tailored to your project needs.
                                        </p>
                                    </div>
                                </div>
                                <div class="rs-why-choose-content-item wow fadeInUp" data-wow-delay=".7s"
                                    data-wow-duration="1s"
                                    style="visibility: visible; animation-duration: 1s; animation-delay: 0.7s; animation-name: fadeInUp;">
                                    <div class="rs-why-choose-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="49"
                                            viewBox="0 0 50 49" fill="none">
                                            <path
                                                d="M46.9297 21.1611C46.7344 15.5954 44.4805 10.3908 40.5229 6.43317C36.3747 2.28418 30.8615 0 25 0C13.1613 0 3.48806 9.42294 3.07108 21.1611C1.26447 21.964 0 23.7722 0 25.8738V31.6636C0 34.5066 2.31288 36.8203 5.15674 36.8203C6.99684 36.8203 8.49332 35.3239 8.49332 33.4838V24.0528C8.49332 22.3252 7.16826 20.9164 5.48362 20.749C6.10549 10.5224 14.6187 2.39181 25 2.39181C30.2237 2.39181 35.1357 4.42804 38.8326 8.12498C42.2274 11.5198 44.2142 15.9446 44.5132 20.7498C42.8302 20.9188 41.5075 22.3268 41.5075 24.0528V33.483C41.5075 35.225 42.8533 36.6425 44.5578 36.79V39.1731C44.5578 41.8567 42.3741 44.0396 39.6905 44.0396H36.086C35.909 43.5341 35.6316 43.0669 35.2425 42.6795C34.5609 41.9946 33.652 41.6175 32.6841 41.6175H28.9688C28.4354 41.6175 27.9236 41.7307 27.4548 41.9492C26.176 42.5368 25.35 43.8267 25.35 45.2355C25.35 46.2034 25.7271 47.1123 26.4104 47.7924C27.0936 48.4772 28.0025 48.8543 28.9688 48.8543H32.6841C34.2244 48.8543 35.5822 47.8585 36.0884 46.4314H39.6905C43.6936 46.4314 46.9496 43.1754 46.9496 39.1731V36.3643C48.7451 35.5567 50 33.7548 50 31.662V25.8722C50 23.7722 48.7355 21.964 46.9297 21.1611ZM6.10071 24.0528V33.483C6.10071 34.0036 5.67736 34.4277 5.15595 34.4277C3.63157 34.4277 2.39101 33.1872 2.39101 31.6628V25.873C2.39101 24.3478 3.63157 23.1081 5.15595 23.1081C5.67736 23.1081 6.10071 23.5322 6.10071 24.0528ZM33.884 45.4922C33.7652 46.0551 33.2597 46.4641 32.6833 46.4641H28.968C28.6411 46.4641 28.3342 46.3365 28.0998 46.1021C27.8686 45.8717 27.741 45.564 27.741 45.2371C27.741 44.7595 28.0209 44.3234 28.4594 44.1217C28.6156 44.0484 28.787 44.0109 28.968 44.0109H32.6833C33.0102 44.0109 33.3171 44.1377 33.5507 44.3721C33.7819 44.6025 33.9095 44.9102 33.9095 45.2371C33.9103 45.3248 33.9007 45.4125 33.884 45.4922ZM47.6082 31.6628C47.6082 33.1872 46.3676 34.4277 44.8433 34.4277C44.3226 34.4277 43.8985 34.0044 43.8985 33.483V24.0528C43.8985 23.5322 44.3218 23.1081 44.8433 23.1081C46.3676 23.1081 47.6082 24.3486 47.6082 25.873V31.6628Z"
                                                fill="white"></path>
                                            <path
                                                d="M32.7427 32.0756C35.5372 32.0756 37.8102 29.8018 37.8102 27.0081V16.6827C37.8102 15.3321 37.2824 14.0597 36.3241 13.1013C35.3657 12.143 34.0941 11.6152 32.7427 11.6152H17.255C14.4605 11.6152 12.1875 13.8883 12.1875 16.6827V27.0081C12.1875 29.8026 14.4605 32.0756 17.255 32.0756H17.3498V34.7512C17.3498 35.7717 17.9581 36.6774 18.8989 37.0593C19.2027 37.1813 19.5184 37.2419 19.8309 37.2419C20.4823 37.2419 21.1169 36.9836 21.5817 36.5028L26.0329 32.0756H32.7427ZM24.6975 30.0314L19.8804 34.8222C19.8588 34.8445 19.8429 34.8612 19.7974 34.8413C19.7424 34.819 19.7424 34.7831 19.7424 34.7512V30.8797C19.7424 30.2195 19.2075 29.6838 18.5465 29.6838H17.2557C15.78 29.6838 14.5801 28.4831 14.5801 27.0081V16.6827C14.5801 15.2069 15.78 14.007 17.2557 14.007H32.7435C33.4563 14.007 34.1268 14.2861 34.6338 14.7924C35.1409 15.2994 35.4192 15.9707 35.4192 16.6827V27.0081C35.4192 28.4839 34.2185 29.6838 32.7435 29.6838H25.541C25.2245 29.6838 24.9215 29.8089 24.6975 30.0314Z"
                                                fill="white"></path>
                                            <path
                                                d="M19.1901 20.2715C18.2175 20.2715 17.4258 21.064 17.4258 22.0358C17.4258 23.0077 18.2183 23.8002 19.1901 23.8002C20.1636 23.8002 20.9561 23.0077 20.9561 22.0358C20.9561 21.064 20.1644 20.2715 19.1901 20.2715Z"
                                                fill="white"></path>
                                            <path
                                                d="M24.9987 20.2715C24.0261 20.2715 23.2344 21.064 23.2344 22.0358C23.2344 23.0077 24.0269 23.8002 24.9987 23.8002C25.973 23.8002 26.7647 23.0077 26.7647 22.0358C26.7647 21.064 25.973 20.2715 24.9987 20.2715Z"
                                                fill="white"></path>
                                            <path
                                                d="M30.8073 20.2715C29.8347 20.2715 29.043 21.064 29.043 22.0358C29.043 23.0077 29.8355 23.8002 30.8073 23.8002C31.7808 23.8002 32.5733 23.0077 32.5733 22.0358C32.5733 21.064 31.7808 20.2715 30.8073 20.2715Z"
                                                fill="white"></path>
                                        </svg>
                                    </div>
                                    <div class="rs-why-choose-content">
                                        <h6 class="rs-why-choose-title">Wide Product Availability</h6>
                                        <p class="descrip">
                                            A comprehensive range of cables, accessories, and electrical solutions available under one roof for faster sourcing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="rs-why-choose-btn-wrapper" data-background="assets/images/why-choose/why_choose.png"
                style="background-image: url(&quot;assets/images/why-choose/why_choose.png&quot;);">

            </div>
        </section>
      


        <!-- portfolio area start -->
        <section class="rs-portfolio-area section-space rs-portfolio-one rs-swiper primary-bg our_products">
            <div class="container">
                <div class="row  g-5 section-title-space align-items-end">
                    <div class="col-xxl-7 col-xl-8 col-lg-8">
                        <div class="rs-section-title-wrapper">
                            <span class="rs-section-subtitle has-theme-orange justify-content-start">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15"
                                    fill="none">
                                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                        fill="#1E2E5E"></path>
                                </svg>
                                Our Products
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade">Polycab Cables
                            </h2>
                        </div>
                    </div>
                    <div class="col-xxl-5 col-xl-4 col-lg-4">
                        <!-- If we need navigation buttons -->
                        <div class=" rs-portfolio-navigation">
                            <button class="swiper-button-prev rs-swiper-btn has-bg-white hover-orange"><i
                                    class="fa-regular fa-arrow-left"></i></button>
                            <button class="swiper-button-next rs-swiper-btn has-bg-white hover-orange"><i
                                    class="fa-regular fa-arrow-right"></i></button>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xl-12">
                        <div class="rs-portfolio-slider-wrapper">
                            <div class="swiper has-space" data-clone-slides="false" data-loop="true" data-speed="1500"
                                data-autoplay="true" data-dots-dynamic="false" data-hover-pause="true"
                                data-effect="false" data-delay="2500" data-item="4" data-item-xl="3" data-item-lg="3"
                                data-item-md="2" data-item-sm="1" data-item-xs="1" data-item-mobile="1" data-margin="30"
                                data-margin-xl="30">
                                <div class="swiper-wrapper">
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/polycab-lv-is-7098-i-4c-a2xfy.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div> -->
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="<?php echo BASE_URL . 'industries/cables-by-type/lv-power-cable.php'; ?>">LV
                                                        Power
                                                        Cables</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="<?php echo BASE_URL . 'industries/cables-by-type/lv-power-cable.php'; ?>"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/polycab-mv-is-7098-ii-3c-a2xwy.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div> -->
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="<?php echo BASE_URL . 'industries/cables-by-type/mv-power-cable.php'; ?>">MV
                                                        Power
                                                        Cables</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="<?php echo BASE_URL . 'industries/cables-by-type/mv-power-cable.php'; ?>"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/polycab-instrumentation-500-tst.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div> -->
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="<?php echo BASE_URL . 'industries/cables-by-type/instrumentation-cable.php'; ?>">Instrumentation
                                                        Cable</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="<?php echo BASE_URL . 'industries/cables-by-type/instrumentation-cable.php'; ?>"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/polycab-ehv-cu-al-cor-132kv.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div> -->
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="<?php echo BASE_URL . 'industries/cables-by-type/ehv-power-cable.php'; ?>">EHV
                                                        Power
                                                        Cable</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="<?php echo BASE_URL . 'industries/cables-by-type/ehv-power-cable.php'; ?>"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
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
            </div>
        </section>
        <!-- portfolio area end -->

         <!-- portfolio area start -->
        <section class="rs-portfolio-area section-space rs-portfolio-one rs-swiper primary-bg our_products">
            <div class="container">
                <div class="row  g-5 section-title-space align-items-end">
                    <div class="col-xxl-7 col-xl-8 col-lg-8">
                        <div class="rs-section-title-wrapper">
                            <span class="rs-section-subtitle has-theme-orange justify-content-start">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15"
                                    fill="none">
                                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                        fill="#1E2E5E"></path>
                                </svg>
                                Our Products
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade">Dowells
                            </h2>
                        </div>
                    </div>
                    <div class="col-xxl-5 col-xl-4 col-lg-4">
                        <!-- If we need navigation buttons -->
                        <div class=" rs-portfolio-navigation">
                            <button class="swiper-button-prev rs-swiper-btn has-bg-white hover-orange"><i
                                    class="fa-regular fa-arrow-left"></i></button>
                            <button class="swiper-button-next rs-swiper-btn has-bg-white hover-orange"><i
                                    class="fa-regular fa-arrow-right"></i></button>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xl-12">
                        <div class="rs-portfolio-slider-wrapper">
                            <div class="swiper has-space" data-clone-slides="false" data-loop="true" data-speed="1500"
                                data-autoplay="true" data-dots-dynamic="false" data-hover-pause="true"
                                data-effect="false" data-delay="2500" data-item="4" data-item-xl="3" data-item-lg="3"
                                data-item-md="2" data-item-sm="1" data-item-xs="1" data-item-mobile="1" data-margin="30"
                                data-margin-xl="30">
                                <div class="swiper-wrapper">
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/dowells/cable_terminal.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                               
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="<?php echo BASE_URL . 'cable-terminal.php'; ?>">Cable Terminal</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="<?php echo BASE_URL . 'cable-terminal.php'; ?>"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/dowells/gland.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div> -->
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="<?php echo BASE_URL . 'gland.php'; ?>">Gland</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="<?php echo BASE_URL . 'gland.php'; ?>"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/dowells/crimping_tool.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div> -->
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="<?php echo BASE_URL . 'crimping-tool.php'; ?>">Crimping Tool</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="<?php echo BASE_URL . 'crimping-tool.php'; ?>"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
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
            </div>
        </section>
        <!-- portfolio area end -->

        <!-- video area start -->
        <!-- <div class="rs-video-area rs-video-one has-theme-orange">
            <div class="container">
                <div class="row  g-5 section-title-space justify-content-center">
                    <div class="col-xl-12 col-lg-12">
                        <div class="rs-section-title-wrapper text-center">
                            <span class="rs-section-subtitle has-theme-orange">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15"
                                    fill="none">
                                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                        fill="#1E2E5E"></path>
                                </svg>
                                Production Process
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade" style="perspective: 400px;">
                                Watch How Our Cables Are Made
                            </h2>
                        </div>
                    </div>


                    <div class="rs-video-wrapper jarallax">
                        <div class="rs-video-bg-thumb jarallax-img" data-background="assets/images/about/about_us.png"></div>
                        <div class="swiper myVideoSwiper">

                            <div class="swiper-wrapper">


                                <div class="swiper-slide">
                                    <div class="video-thumb-wrapper">
                                        <img src="assets/images/video_thumnail/1.png" class="video-thumb">
                                        <a href="https://www.youtube.com/watch?v=I68XHM96L5w" class="video-play-btn popup-video has-theme-orange" target="_blank">
                                            <i class="fa-duotone fa-play"></i>
                                        </a>
                                    </div>
                                </div>


                                <div class="swiper-slide">
                                    <div class="video-thumb-wrapper">
                                        <img src="assets/images/video_thumnail/2.png" class="video-thumb">
                                        <a href="https://www.youtube.com/watch?v=qlD3aglwhOo" class="video-play-btn popup-video has-theme-orange" target="_blank">
                                            <i class="fa-duotone fa-play"></i>
                                        </a>
                                    </div>
                                </div>


                                <div class="swiper-slide">
                                    <div class="video-thumb-wrapper">
                                        <img src="assets/images/video_thumnail/3.png" class="video-thumb">
                                        <a href="https://www.youtube.com/watch?v=Y_W055gtcrA" class="video-play-btn popup-video has-theme-orange" target="_blank">
                                            <i class="fa-duotone fa-play"></i>
                                        </a>
                                    </div>
                                </div>


                                <div class="swiper-slide">
                                    <div class="video-thumb-wrapper">
                                        <img src="assets/images/video_thumnail/4.png" class="video-thumb">
                                        <a href="https://www.youtube.com/watch?v=1kc5o7wvI1s" class="video-play-btn popup-video has-theme-orange" target="_blank">
                                            <i class="fa-duotone fa-play"></i>
                                        </a>
                                    </div>
                                </div>


                                <div class="swiper-slide">
                                    <div class="video-thumb-wrapper">
                                        <img src="assets/images/video_thumnail/5.png" class="video-thumb">
                                        <a href="https://www.youtube.com/watch?v=hx7EPwOv2Eo" class="video-play-btn popup-video has-theme-orange" target="_blank">
                                            <i class="fa-duotone fa-play"></i>
                                        </a>
                                    </div>
                                </div>


                                <div class="swiper-slide">
                                    <div class="video-thumb-wrapper">
                                        <img src="assets/images/video_thumnail/6.png" class="video-thumb">
                                        <a href="https://www.youtube.com/watch?v=Xuj8362TZ9A" class="video-play-btn popup-video has-theme-orange" target="_blank">
                                            <i class="fa-duotone fa-play"></i>
                                        </a>
                                    </div>
                                </div>


                                <div class="swiper-slide">
                                    <div class="video-thumb-wrapper">
                                        <img src="assets/images/video_thumnail/7.png" class="video-thumb">
                                        <a href="https://www.youtube.com/watch?v=41UwYBeFASo" class="video-play-btn popup-video has-theme-orange" target="_blank">
                                            <i class="fa-duotone fa-play"></i>
                                        </a>
                                    </div>
                                </div>

                            </div>


                            <div class="swiper-button-next"></div>
                            <div class="swiper-button-prev"></div>
                        </div>
                    </div>







                </div>
            </div>
        </div> -->
        <!-- video area end -->



        <section class="rs-portfolio-area section-space rs-portfolio-seven rs-swiper">
            <div class="container">
                <div class="row g-5 justify-content-center section-title-space align-items-center">
                    <div class="col-xxl-6 col-xl-7 col-lg-8 col-md-8 col-sm-10">
                        <div class="rs-section-title-wrapper text-center">
                            <span class="rs-section-subtitle has-stroke">
                                Strengthening Businesses Worldwide
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade"
                                style="perspective: 400px;">
                                Industries We Serve
                            </h2>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <div class="rs-portfolio-slider-wrapper">
                            <div class="swiper" data-loop="false" data-speed="1000" data-autoplay="false"
                                data-dots-dynamic="false" data-hover-pause="true" data-effect="slide"
                                data-delay="2000" data-item="3" data-item-xl="3" data-item-lg="3" data-item-md="2"
                                data-item-sm="1" data-item-xs="1" data-margin="30">
                                <div class="swiper-wrapper">
                                    <!-- Repeat for 7 slides -->
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/construction-industry.png'; ?>"
                                                    alt="Construction Industry">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <h5 class="rs-portfolio-title"><a href="#">Construction Industry</a>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/telecommunication-industry.png'; ?>"
                                                    alt="Telecommunications">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <h5 class="rs-portfolio-title"><a href="#">Telecommunications
                                                        Industry</a></h5>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/commercial-industry.png'; ?>"
                                                    alt="Commercial Industry">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <h5 class="rs-portfolio-title"><a href="#">Commercial Industry</a>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/power-generator.png'; ?>"
                                                    alt="Power Generation">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <h5 class="rs-portfolio-title"><a href="#">Power Generation</a></h5>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/oil-and-gas.png'; ?>"
                                                    alt="Oil & Gas">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <h5 class="rs-portfolio-title"><a href="#">Oil & Gas</a></h5>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/petrochemical.png'; ?>"
                                                    alt="Petrochemical">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <h5 class="rs-portfolio-title"><a href="#">Petrochemical
                                                        Industry</a></h5>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/data-center.png'; ?>"
                                                    alt="Datacenter">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <h5 class="rs-portfolio-title"><a href="#">Datacenter Industry</a>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Optional pagination -->
                                <div class="rs-portfolio-pagination">
                                    <div class="swiper-pagination rs-pagination has-theme-orange rs-pagination-2">
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        




        <!-- portfolio area start -->
        <section class="rs-portfolio-area section-space rs-portfolio-one rs-swiper primary-bg d-none">
            <div class="container">
                <div class="row  g-5 section-title-space align-items-end">
                    <div class="col-xxl-7 col-xl-8 col-lg-8">
                        <div class="rs-section-title-wrapper">
                            <span class="rs-section-subtitle has-theme-orange justify-content-start">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15"
                                    fill="none">
                                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#EA5501"></path>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                        fill="#EA5501"></path>
                                </svg>
                                Recent Work
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade">Explore Large-Scale
                                Projects
                            </h2>
                        </div>
                    </div>
                    <div class="col-xxl-5 col-xl-4 col-lg-4">
                        <!-- If we need navigation buttons -->
                        <div class=" rs-portfolio-navigation">
                            <button class="swiper-button-prev rs-swiper-btn has-bg-white hover-orange"><i
                                    class="fa-regular fa-arrow-left"></i></button>
                            <button class="swiper-button-next rs-swiper-btn has-bg-white hover-orange"><i
                                    class="fa-regular fa-arrow-right"></i></button>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xl-12">
                        <div class="rs-portfolio-slider-wrapper">
                            <div class="swiper has-space" data-clone-slides="false" data-loop="true"
                                data-speed="1500" data-autoplay="true" data-dots-dynamic="false"
                                data-hover-pause="true" data-effect="false" data-delay="2500" data-item="4"
                                data-item-xl="3" data-item-lg="3" data-item-md="2" data-item-sm="1" data-item-xs="1"
                                data-item-mobile="1" data-margin="30" data-margin-xl="30">
                                <div class="swiper-wrapper">
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/portfolio-thumb-01.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <div class="rs-portfolio-tag">
                                                    <a href="#">Company</a>
                                                </div>
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="#">Metal
                                                        Industry</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="#"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/our_products/portfolio-thumb-02.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div>
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="portfolio-details.html">Metal
                                                        Industry</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="portfolio-details.html"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/portfolio/portfolio-thumb-03.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div>
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="portfolio-details.html">Manufacture</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="portfolio-details.html"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="assets/images/portfolio/portfolio-thumb-04.png"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Company</a>
                                                </div>
                                                <h4 class="rs-portfolio-title underline has-white"><a
                                                        href="portfolio-details.html">Oil &amp;
                                                        Gas Factory</a></h4>
                                                <div class="rs-portfolio-btn">
                                                    <a href="portfolio-details.html"
                                                        class="rs-btn has-theme-orange has-circle has-icon">
                                                        <span class="icon-box">
                                                            <svg class="icon-first"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                            <svg class="icon-second"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 32 32">
                                                                <path
                                                                    d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z">
                                                                </path>
                                                            </svg>
                                                        </span>
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
            </div>
        </section>
        <!-- portfolio area end -->


        <section class="rs-portfolio-area section-space rs-portfolio-seven rs-swiper d-none">
            <!-- <div class="rs-portfolio-shape">
                    <img src="assets/images/shape/robo-arm-01.png" alt="image">
                </div> -->
            <!-- <div class="rs-portfolio-shape-two has-reverse">
                    <img class="gsap-rotate-anti" src="assets/images/shape/gear-shape-01.png" alt=""
                        style="transform: translate3d(0px, 0px, 0px) rotate(-71.7595deg);">
                </div>
                <div class="rs-portfolio-shape-three">
                    <img class="gsap-rotate" src="assets/images/shape/gear-shape-02.png" alt=""
                        style="transform: translate3d(0px, 0px, 0px) rotate(69.0476deg);">
                </div> -->
            <div class="container">
                <div class="row  g-5 justify-content-center section-title-space align-items-center">
                    <div class="col-xxl-6 col-xl-7 col-lg-8 col-md-8 col-sm-10">
                        <div class="rs-section-title-wrapper text-center">
                            <span class="rs-section-subtitle has-stroke">
                                Strengthening Businesses Worldwide
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade"
                                style="perspective: 400px;">
                                Supplying Quality Wires & Cables to Key Industries
                            </h2>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <div class="rs-portfolio-slider-wrapper">
                            <div class="swiper swiper-initialized swiper-horizontal swiper-pointer-events swiper-backface-hidden"
                                data-clone-slides="false" data-loop="true" data-speed="2000" data-autoplay="true"
                                data-dots-dynamic="false" data-hover-pause="true" data-effect="false"
                                data-delay="1000" data-item="3" data-item-xl="3" data-item-lg="3" data-item-md="2"
                                data-item-sm="1" data-item-xs="1" data-item-mobile="1" data-margin="30">
                                <div class="swiper-wrapper" id="swiper-wrapper-a48271afd4c2b4d8" aria-live="off"
                                    style="transform: translate3d(-2660px, 0px, 0px); transition-duration: 2000ms;">
                                    <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="1"
                                        role="group" aria-label="1 / 7" style="width: 350px; margin-right: 30px;">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/construction-industry.png'; ?>"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Robotic</a>
                                                </div> -->
                                                <h5 class="rs-portfolio-title"><a href="#"> Construction Industry
                                                    </a></h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="2"
                                        role="group" aria-label="2 / 7" style="width: 350px; margin-right: 30px;">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/telecommunication-industry.png'; ?>"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Robotic</a>
                                                </div> -->
                                                <h5 class="rs-portfolio-title"><a href="#">
                                                        Telecommunications Industry
                                                    </a></h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate swiper-slide-duplicate-prev"
                                        data-swiper-slide-index="3" role="group" aria-label="3 / 7"
                                        style="width: 350px; margin-right: 30px;">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/commercial-industry.png'; ?>"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Robotic</a>
                                                </div> -->
                                                <h5 class="rs-portfolio-title"><a href="#">
                                                        Commercial Industry
                                                    </a></h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate-active"
                                        data-swiper-slide-index="4" role="group" aria-label="4 / 7"
                                        style="width: 350px; margin-right: 30px;">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/power-generator.png'; ?>"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Robotic</a>
                                                </div> -->
                                                <h5 class="rs-portfolio-title"><a href="#"> Power
                                                        Generation
                                                    </a></h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate-next"
                                        data-swiper-slide-index="5" role="group" aria-label="5/ 7"
                                        style="width: 350px; margin-right: 30px;">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/oil-and-gas.png'; ?>"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Robotic</a>
                                                </div> -->
                                                <h5 class="rs-portfolio-title"><a href="#">Oil & Gas
                                                    </a></h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide" data-swiper-slide-index="6" role="group"
                                        aria-label="6 / 7" style="width: 350px; margin-right: 30px;">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/petrochemical.png'; ?>"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Robotic</a>
                                                </div> -->
                                                <h5 class="rs-portfolio-title"><a href="#">
                                                        Petrochemical Industry
                                                    </a></h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide" data-swiper-slide-index="7" role="group"
                                        aria-label="7 / 7" style="width: 350px; margin-right: 30px;">
                                        <div class="rs-portfolio-item">
                                            <div class="rs-portfolio-thumb">
                                                <img src="<?php echo BASE_URL . 'assets/images/our_services/data-center.png'; ?>"
                                                    alt="image">
                                            </div>
                                            <div class="rs-portfolio-content">
                                                <!-- <div class="rs-portfolio-tag">
                                                    <a href="portfolio-details.html">Robotic</a>
                                                </div> -->
                                                <h5 class="rs-portfolio-title"><a href="#">
                                                        Datacenter Industry
                                                    </a></h5>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- <div class="swiper-slide swiper-slide-prev" data-swiper-slide-index="3"
                                            role="group" aria-label="4 / 4" style="width: 350px; margin-right: 30px;">
                                            <div class="rs-portfolio-item">
                                                <div class="rs-portfolio-thumb">
                                                    <img src="assets/images/portfolio/portfolio-thumb-28.png"
                                                        alt="image">
                                                </div>
                                                <div class="rs-portfolio-content">
                                                    <div class="rs-portfolio-tag">
                                                        <a href="portfolio-details.html">Robotic</a>
                                                    </div>
                                                    <h5 class="rs-portfolio-title"><a href="portfolio-details.html"> Oil
                                                            &amp; Gas
                                                            Factory
                                                        </a></h5>
                                                </div>
                                            </div>
                                        </div> -->
                                    <!-- <div class="swiper-slide swiper-slide-duplicate swiper-slide-active"
                                            data-swiper-slide-index="0" role="group" aria-label="1 / 4"
                                            style="width: 350px; margin-right: 30px;">
                                            <div class="rs-portfolio-item">
                                                <div class="rs-portfolio-thumb">
                                                    <img src="assets/images/portfolio/portfolio-thumb-29.png"
                                                        alt="image">
                                                </div>
                                                <div class="rs-portfolio-content">
                                                    <div class="rs-portfolio-tag">
                                                        <a href="portfolio-details.html">Robotic</a>
                                                    </div>
                                                    <h5 class="rs-portfolio-title"><a href="portfolio-details.html">
                                                            Metal
                                                            Engineering
                                                        </a></h5>
                                                </div>
                                            </div>
                                        </div> -->
                                    <!-- <div class="swiper-slide swiper-slide-duplicate swiper-slide-next"
                                            data-swiper-slide-index="1" role="group" aria-label="2 / 4"
                                            style="width: 350px; margin-right: 30px;">
                                            <div class="rs-portfolio-item">
                                                <div class="rs-portfolio-thumb">
                                                    <img src="assets/images/portfolio/portfolio-thumb-30.png"
                                                        alt="image">
                                                </div>
                                                <div class="rs-portfolio-content">
                                                    <div class="rs-portfolio-tag">
                                                        <a href="portfolio-details.html">Robotic</a>
                                                    </div>
                                                    <h5 class="rs-portfolio-title"><a href="portfolio-details.html">
                                                            Factory
                                                            Conveyors
                                                        </a></h5>
                                                </div>
                                            </div>
                                        </div> -->
                                    <!-- <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="2"
                                            role="group" aria-label="3 / 4" style="width: 350px; margin-right: 30px;">
                                            <div class="rs-portfolio-item">
                                                <div class="rs-portfolio-thumb">
                                                    <img src="assets/images/portfolio/portfolio-thumb-31.png"
                                                        alt="image">
                                                </div>
                                                <div class="rs-portfolio-content">
                                                    <div class="rs-portfolio-tag">
                                                        <a href="portfolio-details.html">Robotic</a>
                                                    </div>
                                                    <h5 class="rs-portfolio-title"><a href="portfolio-details.html">
                                                            Robotics Industry
                                                        </a></h5>
                                                </div>
                                            </div>
                                        </div> -->
                                </div>
                                <!-- if we need pagination -->
                                <div class="rs-portfolio-pagination">
                                    <div
                                        class="swiper-pagination rs-pagination has-theme-orange rs-pagination-2 swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal">
                                        <span class="swiper-pagination-bullet swiper-pagination-bullet-active"
                                            tabindex="0" role="button" aria-label="Go to slide 1"
                                            aria-current="true"></span><span class="swiper-pagination-bullet"
                                            tabindex="0" role="button" aria-label="Go to slide 2"></span><span
                                            class="swiper-pagination-bullet" tabindex="0" role="button"
                                            aria-label="Go to slide 3"></span><span class="swiper-pagination-bullet"
                                            tabindex="0" role="button" aria-label="Go to slide 4"></span>
                                    </div>
                                </div>
                                <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- work process area start -->
        <section class="rs-work-process-area section-space rs-work-step-two has-theme-orange-two d-none">
            <div class="rs-work-step-bg-thumb" data-background="assets/images/bg/work-process-03.png"></div>
            <div class="container">
                <div class="row align-items-center g-5">
                    <div class="col-xl-7 col-lg-7">
                        <div class="rs-work-process-content-wrapper">
                            <div class="rs-section-title-wrapper section-title-space">
                                <span class="rs-section-subtitle has-theme-orange justify-content-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15"
                                        viewBox="0 0 11 15" fill="none">
                                        <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#EA5501">
                                        </path>
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                            fill="#EA5501"></path>
                                    </svg>
                                    Work Process
                                </span>
                                <h2 class="rs-section-title rs-split-text-enable split-in-fade">How we complete work
                                </h2>
                            </div>
                            <div class="rs-work-step-wrapper">
                                <div class="rs-work-step-item wow fadeInUp" data-wow-delay=".3s"
                                    data-wow-duration="1s">
                                    <span class="rs-work-step-number">01</span>
                                    <h5 class="rs-work-step-title">Product Design and Planning</h5>
                                    <div class="rs-work-step-descrip">
                                        <p>The point of using Lorem Ipsum is that it has more-or-less normal.</p>
                                    </div>
                                </div>
                                <div class="rs-work-step-item wow fadeInUp" data-wow-delay=".5s"
                                    data-wow-duration="1s">
                                    <span class="rs-work-step-number">02</span>
                                    <h5 class="rs-work-step-title">Component Sourcing and Procurement</h5>
                                    <div class="rs-work-step-descrip">
                                        <p>Reader will be distracted by the readable content of a page when looking.
                                        </p>
                                    </div>
                                </div>
                                <div class="rs-work-step-item wow fadeInUp" data-wow-delay=".7s"
                                    data-wow-duration="1s">
                                    <span class="rs-work-step-number">03</span>
                                    <h5 class="rs-work-step-title">Testing and Quality Control</h5>
                                    <div class="rs-work-step-descrip">
                                        <p>Packages and web page editors now use as their default model.</p>
                                    </div>
                                </div>
                                <div class="rs-work-step-item wow fadeInUp" data-wow-delay=".9s"
                                    data-wow-duration="1s">
                                    <span class="rs-work-step-number">04</span>
                                    <h5 class="rs-work-step-title">Final Assembly and Integration</h5>
                                    <div class="rs-work-step-descrip">
                                        <p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced
                                            below.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-5 col-md-5">
                        <div class="rs-contact-form rs-contact-one has-theme-orange-two wow fadeInRight"
                            data-wow-delay=".3s" data-wow-duration="1s">
                            <div class="rs-contact-bg-thumb" data-background="assets/images/bg/contact-bg-02.png">
                            </div>
                            <h3 class="rs-contact-form-title mb-10">Ask Us a Question…</h3>
                            <p class="descrip">The point of using Lorem Ipsum is that it has more-or-less normal</p>
                            <form id="contact-form" action="https://industrie.rstheme.com/html/assets/mailer.php"
                                method="POST">
                                <div class="row g-4">
                                    <div class="col-md-12">
                                        <div class="rs-contact-input">
                                            <input id="name" name="name" type="text" placeholder="Full Name"
                                                required>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="rs-contact-input">
                                            <input id="email" name="email" type="email" placeholder="Email Address"
                                                required>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="rs-contact-input">
                                            <input id="info" name="name" type="text" placeholder="Your Inquiry"
                                                required>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="rs-contact-input">
                                            <textarea id="message" name="message" placeholder="Write Your Message"
                                                required></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="rs-contact-btn">
                                            <button type="submit" class="rs-btn has-theme-orange">Send
                                                Message</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <div id="form-messages"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- work process area end -->

        <!-- faq area start -->
        <section class="rs-faq-area section-space rs-faq-one d-none">
            <div class="rs-faq-bg-thumb" data-background="assets/images/bg/faq-bg-03.png"></div>
            <div class="container">
                <div class="row g-5">
                    <div class="col-xl-6 col-lg-6">
                        <!-- faq area start -->
                        <div class="rs-faq-wrapper">
                            <div class="rs-section-title-wrapper section-title-space">
                                <span class="rs-section-subtitle has-theme-orange justify-content-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15"
                                        viewBox="0 0 11 15" fill="none">
                                        <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#EA5501">
                                        </path>
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                            fill="#EA5501"></path>
                                    </svg>
                                    Faq's
                                </span>
                                <h2 class="rs-section-title rs-split-text-enable split-in-fade">General Questions
                                </h2>
                            </div>
                            <div class="rs-faq-content rs-accordion-one has-theme-orange">
                                <div class="accordion-wrapper">
                                    <div class="accordion" id="accordionExampleOne">
                                        <div class="rs-accordion-item has-border-active">
                                            <h4 class="accordion-header" id="headingOne">
                                                <button class="accordion-button" type="button"
                                                    data-bs-toggle="collapse" data-bs-target="#collapseOne"
                                                    aria-expanded="true" aria-controls="collapseOne">
                                                    01. Why is sand important for industry?
                                                    <span class="accordion-btn"></span>
                                                </button>
                                            </h4>
                                            <div id="collapseOne" class="accordion-collapse collapse show"
                                                data-bs-parent="#accordionExampleOne">
                                                <div class="accordion-body"> Randomised words which don’t look even
                                                    slightly
                                                    believable. If you are going to use a passage of Lorem Ipsum,
                                                    you
                                                    need to be sure
                                                    there isn’t anything.
                                                </div>
                                            </div>
                                        </div>
                                        <div class="rs-accordion-item has-border-active">
                                            <h6 class="accordion-header" id="headingTwo">
                                                <button class="accordion-button collapsed" type="button"
                                                    data-bs-toggle="collapse" data-bs-target="#collapseTwo"
                                                    aria-expanded="false" aria-controls="collapseTwo">
                                                    02. Can I switch to a different plan?
                                                    <span class="accordion-btn"></span>
                                                </button>
                                            </h6>
                                            <div id="collapseTwo" class="accordion-collapse collapse"
                                                data-bs-parent="#accordionExampleOne">
                                                <div class="accordion-body">Randomised words which don’t look even
                                                    slightly
                                                    believable. If you are going to use a passage of Lorem Ipsum,
                                                    you
                                                    need to be sure
                                                    there isn’t anything.</div>
                                            </div>
                                        </div>
                                        <div class="rs-accordion-item has-border-active">
                                            <h6 class="accordion-header" id="headingThree">
                                                <button class="accordion-button collapsed" type="button"
                                                    data-bs-toggle="collapse" data-bs-target="#collapseThree"
                                                    aria-expanded="false" aria-controls="collapseThree">
                                                    03. What should I wear for an industry treatment?
                                                    <span class="accordion-btn"></span>
                                                </button>
                                            </h6>
                                            <div id="collapseThree" class="accordion-collapse collapse"
                                                data-bs-parent="#accordionExampleOne">
                                                <div class="accordion-body">Randomised words which don’t look even
                                                    slightly
                                                    believable. If you are going to use a passage of Lorem Ipsum,
                                                    you
                                                    need to be sure
                                                    there isn’t anything.</div>
                                            </div>
                                        </div>
                                        <div class="rs-accordion-item has-border-active">
                                            <h6 class="accordion-header" id="headingFour">
                                                <button class="accordion-button collapsed" type="button"
                                                    data-bs-toggle="collapse" data-bs-target="#collapseFour"
                                                    aria-expanded="false" aria-controls="collapseFour">
                                                    04. Can you give tips for the stock market?
                                                    <span class="accordion-btn"></span>
                                                </button>
                                            </h6>
                                            <div id="collapseFour" class="accordion-collapse collapse"
                                                data-bs-parent="#accordionExampleOne">
                                                <div class="accordion-body">Randomised words which don’t look even
                                                    slightly
                                                    believable. If you are going to use a passage of Lorem Ipsum,
                                                    you
                                                    need to be sure
                                                    there isn’t anything.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- faq area end -->
                    </div>
                    <!-- testimonial area start -->
                    <div class="col-xl-6 col-lg-6">
                        <div class="rs-testimonial-wrapper rs-testimonial-two rs-swiper">
                            <div class="rs-section-title-wrapper section-title-space">
                                <span class="rs-section-subtitle has-theme-red justify-content-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15"
                                        viewBox="0 0 11 15" fill="none">
                                        <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#EA5501">
                                        </path>
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                            fill="#EA5501"></path>
                                    </svg>
                                    Reviews
                                </span>
                                <h2 class="rs-section-title rs-split-text-enable split-in-fade">Customer Feedback
                                </h2>
                            </div>
                            <div class="rs-testimonial-slider-wrapper">
                                <div class="swiper" data-clone-slides="false" data-loop="true" data-speed="1500"
                                    data-autoplay="true" data-dots-dynamic="false" data-hover-pause="true"
                                    data-effect="false" data-delay="2500" data-item="1" data-item-xl="1"
                                    data-item-lg="1" data-item-md="1" data-item-sm="1" data-item-xs="1"
                                    data-item-mobile="1" data-margin="30" data-margin-xl="30">
                                    <div class="swiper-wrapper">
                                        <div class="swiper-slide">
                                            <div class="rs-testimonial-item">
                                                <div class="rs-testimonial-avater-thumb">
                                                    <div class="rs-testimonial-thumb">
                                                        <img src="assets/images/user/user-thumb-01.png" alt="image">
                                                    </div>
                                                    <div class="rs-testimonial-icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="40"
                                                            height="29" viewBox="0 0 40 29" fill="none">
                                                            <path
                                                                d="M2.85714 29H11.4286L17.1429 17.4V0H0V17.4H8.57143L2.85714 29ZM25.7143 29H34.2857L40 17.4V0H22.8571V17.4H31.4286L25.7143 29Z"
                                                                fill="white" fill-opacity="0.4"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div class="rs-testimonial-content">
                                                    <h5 class="rs-testimonial-title">Best Company</h5>
                                                    <div class="rs-testimonial-description">
                                                        <p>Podcasting operational change management inside of
                                                            workflows
                                                            to establish a
                                                            framework Taking seamless key performance indicators.
                                                        </p>
                                                    </div>
                                                    <div class="rs-tesimonial-avater-info">
                                                        <h6 class="rs-testimonial-avater-title">Nayeem</h6>
                                                        <span
                                                            class="rs-testimonial-avater-designation">Manager</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="swiper-slide">
                                            <div class="rs-testimonial-item">
                                                <div class="rs-testimonial-avater-thumb">
                                                    <div class="rs-testimonial-thumb">
                                                        <img src="assets/images/user/user-thumb-02.png" alt="image">
                                                    </div>
                                                    <div class="rs-testimonial-icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="40"
                                                            height="29" viewBox="0 0 40 29" fill="none">
                                                            <path
                                                                d="M2.85714 29H11.4286L17.1429 17.4V0H0V17.4H8.57143L2.85714 29ZM25.7143 29H34.2857L40 17.4V0H22.8571V17.4H31.4286L25.7143 29Z"
                                                                fill="white" fill-opacity="0.4"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div class="rs-testimonial-content">
                                                    <h5 class="rs-testimonial-title">Best Company</h5>
                                                    <div class="rs-testimonial-description">
                                                        <p>Podcasting operational change management inside of
                                                            workflows
                                                            to establish a
                                                            framework Taking seamless key performance indicators.
                                                        </p>
                                                    </div>
                                                    <div class="rs-tesimonial-avater-info">
                                                        <h6 class="rs-testimonial-avater-title">Abdur Rashid</h6>
                                                        <span class="rs-testimonial-avater-designation">Founder
                                                            &amp;
                                                            CEO</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="swiper-slide">
                                            <div class="rs-testimonial-item">
                                                <div class="rs-testimonial-avater-thumb">
                                                    <div class="rs-testimonial-thumb">
                                                        <img src="assets/images/user/user-thumb-03.png" alt="image">
                                                    </div>
                                                    <div class="rs-testimonial-icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="40"
                                                            height="29" viewBox="0 0 40 29" fill="none">
                                                            <path
                                                                d="M2.85714 29H11.4286L17.1429 17.4V0H0V17.4H8.57143L2.85714 29ZM25.7143 29H34.2857L40 17.4V0H22.8571V17.4H31.4286L25.7143 29Z"
                                                                fill="white" fill-opacity="0.4"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div class="rs-testimonial-content">
                                                    <h5 class="rs-testimonial-title">Best Company</h5>
                                                    <div class="rs-testimonial-description">
                                                        <p>Podcasting operational change management inside of
                                                            workflows
                                                            to establish a
                                                            framework Taking seamless key performance indicators.
                                                        </p>
                                                    </div>
                                                    <div class="rs-tesimonial-avater-info">
                                                        <h6 class="rs-testimonial-avater-title">Tom Hanks</h6>
                                                        <span
                                                            class="rs-testimonial-avater-designation">Customer</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- If we need navigation buttons -->
                                    <div class=" rs-testimonial-navigation">
                                        <button
                                            class="swiper-button-prev rs-swiper-btn has-bg-white hover-black has-small"><i
                                                class="fa-regular fa-arrow-left"></i></button>
                                        <button
                                            class="swiper-button-next rs-swiper-btn has-bg-white hover-black has-small"><i
                                                class="fa-regular fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- testimonial area end -->
                </div>
            </div>
        </section>
        <!-- faq area end -->

        <!-- blog area start -->
        <section class="rs-blog-area section-space rs-blog-two has-theme-orange has-pos-none rs-swiper d-none">
            <div class="container">
                <div class="row justify-content-center align-items-center">
                    <div class="col-xl-7 col-lg-8">
                        <div class="rs-section-title-wrapper text-center section-title-space">
                            <span class="rs-section-subtitle has-theme-orange">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15"
                                    fill="none">
                                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#EA5501"></path>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                        fill="#EA5501"></path>
                                </svg>
                                News &amp; Blog
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade">Discover the future
                                factories and
                                industries
                            </h2>
                        </div>
                    </div>
                </div>
                <div class="rs-blog-slider">
                    <div class="swiper" data-clone-slides="false" data-loop="true" data-speed="1500"
                        data-autoplay="true" data-dots-dynamic="false" data-hover-pause="true" data-effect="false"
                        data-delay="2500" data-item="3" data-item-xl="3" data-item-lg="3" data-item-md="2"
                        data-item-sm="1" data-item-xs="1" data-item-mobile="1" data-margin="30" data-margin-xl="30">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide">
                                <div class="rs-blog-item">
                                    <div class="rs-blog-thumb">
                                        <a href="blog-details.html"> <img src="assets/images/blog/blog-thumb-04.png"
                                                alt="image"></a>
                                    </div>
                                    <div class="rs-blog-content">
                                        <div class="rs-blog-tag has-theme-orange">
                                            <a href="blog-details.html">Company</a>
                                        </div>
                                        <h5 class="rs-blog-title underline has-black"> <a
                                                href="blog-details.html">Construction of
                                                a
                                                new high tech plant in Washington</a></h5>
                                        <div class="rs-blog-meta">
                                            <div class="rs-blog-meta-item">
                                                <span>
                                                    By
                                                    <a class="rs-blog-meta-author" href="#"> Nayeem</a>
                                                </span>
                                            </div>
                                            <div class="rs-blog-meta-item">
                                                <span>
                                                    Feb 8, 2024
                                                </span>
                                            </div>
                                        </div>
                                        <div class="rs-blog-btn-wrapper">
                                            <span class="rs-blog-meta-text">22 min read</span>
                                            <a class="rs-square-btn has-icon has-light-grey"
                                                href="blog-details.html">
                                                <span class="icon-box">
                                                    <i class="ri-arrow-right-line icon-first"></i>
                                                    <i class="ri-arrow-right-line icon-second"></i>
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="rs-blog-item">
                                    <div class="rs-blog-thumb">
                                        <a href="blog-details.html"> <img src="assets/images/blog/blog-thumb-05.png"
                                                alt="image"></a>
                                    </div>
                                    <div class="rs-blog-content">
                                        <div class="rs-blog-tag has-theme-orange">
                                            <a href="blog-details.html">industry</a>
                                        </div>
                                        <h5 class="rs-blog-title underline has-black"> <a
                                                href="blog-details.html">Building
                                                resilient supply for industries and factorie</a></h5>
                                        <div class="rs-blog-meta">
                                            <div class="rs-blog-meta-item">
                                                <span>
                                                    By
                                                    <a class="rs-blog-meta-author" href="#"> Nayeem</a>
                                                </span>
                                            </div>
                                            <div class="rs-blog-meta-item">
                                                <span>
                                                    Feb 8, 2024
                                                </span>
                                            </div>
                                        </div>
                                        <div class="rs-blog-btn-wrapper">
                                            <span class="rs-blog-meta-text">22 min read</span>
                                            <a class="rs-square-btn has-icon has-light-grey"
                                                href="blog-details.html">
                                                <span class="icon-box">
                                                    <i class="ri-arrow-right-line icon-first"></i>
                                                    <i class="ri-arrow-right-line icon-second"></i>
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="rs-blog-item">
                                    <div class="rs-blog-thumb">
                                        <a href="blog-details.html"> <img src="assets/images/blog/blog-thumb-06.png"
                                                alt="image"></a>
                                    </div>
                                    <div class="rs-blog-content">
                                        <div class="rs-blog-tag has-theme-orange">
                                            <a href="blog-details.html">Gas &amp; Oil</a>
                                        </div>
                                        <h5 class="rs-blog-title underline has-black"> <a href="blog-details.html">
                                                Interactive
                                                technologies in factories and plants</a></h5>
                                        <div class="rs-blog-meta">
                                            <div class="rs-blog-meta-item">
                                                <span>
                                                    By
                                                    <a class="rs-blog-meta-author" href="#"> Nayeem</a>
                                                </span>
                                            </div>
                                            <div class="rs-blog-meta-item">
                                                <span>
                                                    Feb 8, 2024
                                                </span>
                                            </div>
                                        </div>
                                        <div class="rs-blog-btn-wrapper">
                                            <span class="rs-blog-meta-text">22 min read</span>
                                            <a class="rs-square-btn has-icon has-light-grey"
                                                href="blog-details.html">
                                                <span class="icon-box">
                                                    <i class="ri-arrow-right-line icon-first"></i>
                                                    <i class="ri-arrow-right-line icon-second"></i>
                                                </span>
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
        <!-- blog area end -->

        <!-- brand area start -->
        <div class="rs-brand-area rs-brand-five section-space-bottom rs-swiper has-pos-none d-none">

            <div class="container">
                <div class="row">

                    <div class="col-xl-12">
                        <div class="rs-brand-wrapper">
                            <div class="swiper" data-clone-slides="false" data-loop="true" data-speed="1500"
                                data-autoplay="false" data-dots-dynamic="false" data-center-mode="false"
                                data-hover-pause="true" data-effect="false" data-delay="1500" data-item="6"
                                data-item-xl="4" data-item-lg="4" data-item-md="3" data-item-sm="2" data-item-xs="2"
                                data-item-mobile="1">
                                <div class="swiper-wrapper">
                                    <div class="swiper-slide">
                                        <div class="rs-brand-item">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-02.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-brand-item">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-03.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-brand-item">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-04.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-brand-item">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-05.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-brand-item">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-06.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-brand-item">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-07.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide">
                                        <div class="rs-brand-item">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-02.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- brand area end -->


        <section class="rs-contact-area rs-contact-one section-space has-theme-orange p-relative contact_us_sec">
            <div class="rs-contact-bg-thumb" data-background="assets/images/bg/contact-form-bg.png"
                style="background-image: url(&quot;assets/images/bg/contact-bg-04.png&quot;);"></div>
            <div class="container">
                <div class="row align-items-xl-center g-5">
                    <div class="col-xl-5 col-lg-5">
                        <div class="rs-contact-wrapper">
                            <!-- <div class="rs-section-title-wrapper">
                                <span class="rs-section-subtitle has-theme-orange justify-content-start">
                                    Contact
                                </span>
                                <h2 class="rs-section-title mb-30 rs-split-text-enable split-in-fade"
                                    style="perspective: 400px;">
                                    Reach Out to Us
                                </h2>
                                <p class="descrip">Whether you have questions, feedback, or just want to say hello,
                                    we're always happy to hear from you. Choose a convenient method below to get in
                                    touch.</p>
                            </div>

                            <div class="rs-contact-list">
                                <div class="rs-contact-list-item wow fadeIn" data-wow-delay=".3s"
                                    style="visibility: visible; animation-delay: 0.3s; animation-name: fadeIn;">
                                    <div class="rs-contact-icon">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="35"
                                                viewBox="0 0 30 35" fill="none">
                                                <path
                                                    d="M20.6984 22.653C24.3306 16.928 23.874 17.6423 23.9787 17.493C25.3011 15.6195 26 13.4144 26 11.1161C26 5.02098 21.0759 0 15 0C8.94387 0 4 5.01107 4 11.1161C4 13.4129 4.7136 15.6757 6.07933 17.5745L9.30147 22.6531C5.85647 23.1848 0 24.7696 0 28.2589C0 29.5309 0.826533 31.3436 4.76413 32.7562C7.5136 33.7425 11.1487 34.2857 15 34.2857C22.2017 34.2857 30 32.2452 30 28.2589C30 24.7689 24.1504 23.1859 20.6984 22.653ZM7.74993 16.4695C7.73893 16.4523 7.72747 16.4354 7.71547 16.4188C6.579 14.8483 6 12.9871 6 11.1161C6 6.09254 10.0271 2.00893 15 2.00893C19.9626 2.00893 24 6.09435 24 11.1161C24 12.9901 23.4319 14.7882 22.3569 16.3173C22.2606 16.4449 22.7632 15.6606 15 27.8966L7.74993 16.4695ZM15 32.2768C7.13373 32.2768 2 29.9543 2 28.2589C2 27.1195 4.63787 25.2459 10.4832 24.5156L14.1567 30.3055C14.3403 30.5949 14.6583 30.7701 14.9999 30.7701C15.3416 30.7701 15.6597 30.5948 15.8432 30.3055L19.5166 24.5156C25.3621 25.2459 28 27.1195 28 28.2589C28 29.9399 22.9125 32.2768 15 32.2768Z"
                                                    fill="white"></path>
                                                <path
                                                    d="M15.0039 6.09375C12.2469 6.09375 10.0039 8.34676 10.0039 11.1161C10.0039 13.8854 12.2469 16.1384 15.0039 16.1384C17.7609 16.1384 20.0039 13.8854 20.0039 11.1161C20.0039 8.34676 17.7609 6.09375 15.0039 6.09375ZM15.0039 14.1295C13.3497 14.1295 12.0039 12.7777 12.0039 11.1161C12.0039 9.45449 13.3497 8.10268 15.0039 8.10268C16.6581 8.10268 18.0039 9.45449 18.0039 11.1161C18.0039 12.7777 16.6581 14.1295 15.0039 14.1295Z"
                                                    fill="white"></path>
                                            </svg>
                                        </span>
                                    </div>
                                    <div class="rs-contact-list-content">
                                        <span>New York</span>
                                        <h6><a href="#"> 42 Mamnoun Street, Saba Carpet and Antiques Store, UK</a></h6>
                                    </div>
                                </div>
                                <div class="rs-contact-list-item wow fadeIn" data-wow-delay=".5s"
                                    style="visibility: visible; animation-delay: 0.5s; animation-name: fadeIn;">
                                    <div class="rs-contact-icon">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"
                                                viewBox="0 0 30 30" fill="none">
                                                <path
                                                    d="M23.7225 18.5848C23.1074 17.9453 22.3655 17.6034 21.5792 17.6034C20.7993 17.6034 20.051 17.9389 19.4106 18.5784L17.4068 20.573C17.242 20.4843 17.0771 20.402 16.9186 20.3197C16.6903 20.2057 16.4747 20.0981 16.2908 19.9841C14.4139 18.7937 12.7081 17.2424 11.0722 15.2353C10.2795 14.2348 9.74688 13.3927 9.36008 12.5379C9.88004 12.063 10.362 11.5691 10.8312 11.0943C11.0087 10.917 11.1863 10.7333 11.3638 10.556C12.6955 9.22637 12.6955 7.50412 11.3638 6.17444L9.63274 4.44585C9.43617 4.24957 9.23326 4.04695 9.04303 3.84433C8.66256 3.45176 8.26308 3.04652 7.85091 2.66662C7.23583 2.05876 6.50028 1.73584 5.72667 1.73584C4.95307 1.73584 4.20483 2.05876 3.57072 2.66662C3.56438 2.67295 3.56438 2.67295 3.55804 2.67928L1.40209 4.85109C0.590443 5.66156 0.127549 6.64932 0.0260924 7.79538C-0.126092 9.64427 0.419236 11.3665 0.837743 12.4936C1.86499 15.2606 3.39952 17.825 5.68862 20.573C8.46599 23.8845 11.8077 26.4995 15.625 28.3421C17.0834 29.0323 19.0301 29.8491 21.2051 29.9884C21.3383 29.9947 21.4778 30.001 21.6046 30.001C23.0694 30.001 24.2995 29.4755 25.2634 28.4307C25.2697 28.4181 25.2824 28.4117 25.2887 28.3991C25.6185 28.0002 25.9989 27.6393 26.3984 27.253C26.6711 26.9934 26.9501 26.7212 27.2227 26.4362C27.8505 25.784 28.1802 25.0242 28.1802 24.2454C28.1802 23.4603 27.8442 22.7068 27.2037 22.0736L23.7225 18.5848ZM25.9926 25.2522C25.9862 25.2522 25.9862 25.2585 25.9926 25.2522C25.7453 25.5181 25.4916 25.7587 25.219 26.0247C24.8068 26.4172 24.3883 26.8288 23.9952 27.291C23.3547 27.9749 22.6001 28.2978 21.6109 28.2978C21.5158 28.2978 21.4144 28.2978 21.3192 28.2914C19.436 28.1711 17.6858 27.4366 16.3732 26.8098C12.7842 25.0749 9.63274 22.6118 7.0139 19.4902C4.85161 16.8879 3.40586 14.4818 2.44836 11.8984C1.85865 10.3218 1.64305 9.0934 1.73817 7.93468C1.80158 7.19386 2.08692 6.57967 2.61323 6.05413L4.77552 3.89499C5.08623 3.60372 5.41596 3.44543 5.73935 3.44543C6.13884 3.44543 6.46223 3.68604 6.66514 3.88865C6.67148 3.89499 6.67782 3.90132 6.68417 3.90765C7.07097 4.26856 7.43875 4.64214 7.82555 5.04104C8.02212 5.24366 8.22503 5.44628 8.42795 5.65523L10.159 7.38381C10.8312 8.05498 10.8312 8.6755 10.159 9.34667C9.97515 9.5303 9.79761 9.71392 9.61372 9.89121C9.08107 10.4357 8.57379 10.9423 8.02212 11.4362C8.00944 11.4488 7.99676 11.4552 7.99042 11.4678C7.44509 12.0124 7.54654 12.5442 7.66068 12.9051C7.66702 12.9241 7.67336 12.9431 7.67971 12.9621C8.12992 14.0512 8.76402 15.077 9.72785 16.299L9.7342 16.3053C11.4843 18.4581 13.3296 20.1361 15.365 21.4214C15.625 21.5861 15.8913 21.719 16.145 21.8457C16.3732 21.9596 16.5888 22.0673 16.7727 22.1812C16.7981 22.1939 16.8235 22.2129 16.8488 22.2256C17.0644 22.3332 17.2673 22.3839 17.4766 22.3839C18.0029 22.3839 18.3326 22.0546 18.4404 21.947L20.609 19.7815C20.8246 19.5662 21.1671 19.3066 21.5665 19.3066C21.9597 19.3066 22.2831 19.5535 22.4796 19.7688C22.486 19.7752 22.486 19.7752 22.4923 19.7815L25.9862 23.2703C26.6394 23.9162 26.6394 24.581 25.9926 25.2522Z"
                                                    fill="white"></path>
                                                <path
                                                    d="M16.2163 7.13613C17.8777 7.41473 19.3869 8.19988 20.5917 9.40292C21.7964 10.606 22.5764 12.1129 22.8617 13.7719C22.9315 14.1898 23.2929 14.481 23.7051 14.481C23.7558 14.481 23.8002 14.4747 23.8509 14.4684C24.3202 14.3924 24.6309 13.9492 24.5548 13.4806C24.2124 11.4734 23.2612 9.64353 21.8091 8.19355C20.357 6.74356 18.5245 5.79379 16.5144 5.45187C16.0451 5.37589 15.6076 5.68615 15.5252 6.14837C15.4427 6.61059 15.7471 7.06015 16.2163 7.13613Z"
                                                    fill="white"></path>
                                                <path
                                                    d="M29.9883 13.2338C29.4239 9.92864 27.864 6.92103 25.4671 4.52761C23.0702 2.13419 20.0582 0.576563 16.7482 0.0130318C16.2853 -0.0692817 15.8478 0.247309 15.7654 0.709531C15.6893 1.17808 16 1.61498 16.4692 1.69729C19.4241 2.19751 22.1191 3.59683 24.2623 5.73065C26.4056 7.8708 27.8006 10.5618 28.3016 13.5124C28.3713 13.9303 28.7328 14.2216 29.1449 14.2216C29.1956 14.2216 29.24 14.2153 29.2908 14.2089C29.7537 14.1393 30.0707 13.6961 29.9883 13.2338Z"
                                                    fill="white"></path>
                                            </svg>
                                        </span>
                                    </div>
                                    <div class="rs-contact-list-content">
                                        <span>Phone Number</span>
                                        <h6 class="mb-5"><a href="tel:971551579261">+971 551 579 261</a></h6>
                                        <h6><a href="tel:971551579261">+97 155 596 1659</a></h6>
                                    </div>
                                </div>
                                <div class="rs-contact-list-item wow fadeIn" data-wow-delay=".7s"
                                    style="visibility: visible; animation-delay: 0.7s; animation-name: fadeIn;">
                                    <div class="rs-contact-icon">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                viewBox="0 0 16 16" fill="none">
                                                <path
                                                    d="M2 2C0.895431 2 0 2.89543 0 4V12L2.58386e-05 12.0103C0.00555998 13.1101 0.898859 14 2 14H7.5C7.77614 14 8 13.7761 8 13.5C8 13.2239 7.77614 13 7.5 13H2C1.53715 13 1.14774 12.6855 1.03376 12.2586L6.67417 8.7876L8 9.5831L15 5.3831V8.5C15 8.77614 15.2239 9 15.5 9C15.7761 9 16 8.77614 16 8.5V4C16 2.89543 15.1046 2 14 2H2ZM5.70808 8.20794L1 11.1052V5.3831L5.70808 8.20794ZM1 4.2169V4C1 3.44772 1.44772 3 2 3H14C14.5523 3 15 3.44772 15 4V4.2169L8 8.4169L1 4.2169Z"
                                                    fill="#6D6D6D"></path>
                                                <path
                                                    d="M14.2467 14.2686C15.2567 14.2686 15.8339 13.4116 15.8339 12.2442V12.0344C15.8339 10.4297 14.6402 9 12.5197 9H12.4847C10.421 9 9 10.3598 9 12.4322V12.6465C9 14.8195 10.4385 16 12.3579 16H12.4016C12.9963 16 13.4204 15.9257 13.639 15.8251V15.0949C13.3941 15.2042 12.9656 15.2742 12.4585 15.2742H12.4147C11.0812 15.2742 9.84385 14.4872 9.84385 12.6202V12.4628C9.84385 10.8057 10.9019 9.73891 12.4847 9.73891H12.524C14.0587 9.73891 15.0075 10.7883 15.0075 12.065V12.183C15.0075 13.158 14.6839 13.5734 14.3691 13.5734C14.1374 13.5734 13.9582 13.4247 13.9582 13.1537V10.9631H13.0531V11.5315H13.0225C12.9394 11.2342 12.6552 10.9019 12.0693 10.9019C11.2911 10.9019 10.8101 11.4572 10.8101 12.3011V12.8301C10.8101 13.722 11.2998 14.2642 12.0693 14.2642C12.5415 14.2642 12.9656 14.0369 13.0837 13.6215H13.1274C13.2455 14.0412 13.7439 14.2686 14.2467 14.2686ZM11.7939 12.6814V12.4541C11.7939 11.9076 12.0212 11.6627 12.3666 11.6627C12.664 11.6627 12.9394 11.8551 12.9394 12.371V12.7383C12.9394 13.3111 12.6858 13.4816 12.3754 13.4816C12.0212 13.4816 11.7939 13.2673 11.7939 12.6814Z"
                                                    fill="#6D6D6D"></path>
                                            </svg>
                                        </span>
                                    </div>
                                    <div class="rs-contact-list-content">
                                        <span>Email Address</span>
                                        <p> Interested in working with us?</p>
                                        <h6><a href="mailto:support.industrie@gmail.com">support.industrie@gmail.com</a>
                                        </h6>
                                    </div>
                                </div>
                                <div class="rs-contact-list-item wow fadeIn" data-wow-delay=".9s"
                                    style="visibility: visible; animation-delay: 0.9s; animation-name: fadeIn;">
                                    <div class="rs-contact-icon">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24"
                                                width="512" height="512">
                                                <path
                                                    d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22Z">
                                                </path>
                                                <path
                                                    d="M12,6a1,1,0,0,0-1,1v4.325L7.629,13.437a1,1,0,0,0,1.062,1.7l3.84-2.4A1,1,0,0,0,13,11.879V7A1,1,0,0,0,12,6Z">
                                                </path>
                                            </svg>
                                        </span>
                                    </div>
                                    <div class="rs-contact-list-content">
                                        <span>Opening Hour</span>
                                        <p class=""> Mon - Fri: 09am - 07pm</p>
                                    </div>
                                </div>
                            </div> -->
                            <div class="contact-map">
                                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7357.08999728618!2d75.90854!3d22.782261!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39631da62f44dfe1%3A0xb76224f845182eed!2sSiddharth%20Farms!5e0!3m2!1sen!2sin!4v1768201690028!5m2!1sen!2sin" width="500" height="580" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>

                        </div>
                    </div>
                    <div class="col-xl-7 col-lg-7">
                        <div class="rs-contact-form wow fadeInRight" data-wow-delay=".3s" data-wow-duration="1s"
                            style="visibility: visible; animation-duration: 1s; animation-delay: 0.3s; animation-name: fadeInRight;">
                            <div class="rs-contact-form-bg-thumb"
                                data-background="assets/images/bg/contact-bg-03.png"
                                style="background-image: url(&quot;assets/images/bg/contact-bg-03.png&quot;);">
                            </div>
                            <h3 class="rs-contact-form-title">Get in Touch</h3>
                            <p class="descrip">We're here to assist you. Please fill out the form below and our team
                                will get back
                                to you promptly.</p>
                            <form id="main-form" method="POST" method="POST" enctype="multipart/form-data">
                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <div class="rs-contact-input">
                                            <input id="name" name="name" type="text" placeholder="Full Name"
                                                required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="rs-contact-input">
                                            <input id="cname" name="cname" type="text" placeholder="Company Name"
                                                required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="rs-contact-input">
                                            <input id="email" name="email" type="email" placeholder="Email Address"
                                                required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="rs-contact-input">
                                            <input id="info" name="mobile" type="text" placeholder="Phone Number"
                                                required>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="rs-contact-input">
                                            <textarea id="message" name="message" placeholder="Write Your Message"
                                                required></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-12 d-flex justify-content-start">
                                        <div class="rs-contact-input text-center">
                                            <input type="file" name="file" accept=".pdf,.doc,.docx,.jpg,.png">
                                        </div>
                                    </div>
                                     <div class="rs-contact-input col-md-12 d-flex align-items-center gap-2">
                                                <span class="captcha-box"
                                                    id="captchaValue2"><?php echo htmlspecialchars($_SESSION['captcha']); ?></span>
                                                <span class="captcha-refresh text-white" id="refreshCaptcha2"
                                                    style="cursor:pointer;color:#000">Refresh</span>
                                                <input type="text" name="captcha_input" id="captcha_input"
                                                    class="form-control" placeholder="Type the number here">
                                            </div>
                                    <div class="col-md-12">
                                        <div class="rs-contact-btn">
                                            <button type="submit" class="rs-btn black-bg">Send Message</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <div id="form-messages"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <section class="rs-brand-area rs-brand-one section-space-bottom primary-bg rs-swiper clientle_sec d-none">
            <div class="container">
                <div class="row  g-5 section-title-space justify-content-center">
                    <div class="col-xl-12 col-lg-12">
                        <div class="rs-section-title-wrapper text-center">
                            <span class="rs-section-subtitle has-theme-orange">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15"
                                    fill="none">
                                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                        fill="#1E2E5E"></path>
                                </svg>
                                Partners
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade"
                                style="perspective: 400px;">
                                Trusted by Leading Companies Worldwide
                            </h2>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xl-12">
                        <div class="rs-brand-wrapper">
                            <div class="swiper swiper-initialized swiper-horizontal swiper-pointer-events"
                                data-clone-slides="false" data-loop="true" data-speed="1500" data-autoplay="false"
                                data-dots-dynamic="false" data-center-mode="false" data-hover-pause="true"
                                data-effect="false" data-delay="1500" data-item="6" data-item-xl="4"
                                data-item-lg="4" data-item-md="3" data-item-sm="2" data-item-xs="2"
                                data-item-mobile="1">
                                <div class="swiper-wrapper" id="swiper-wrapper-ca7945a4d8710189e" aria-live="polite"
                                    style="transform: translate3d(-1900px, 0px, 0px); transition-duration: 0ms;">
                                    <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="0"
                                        role="group" aria-label="1 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-02.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="1"
                                        role="group" aria-label="2 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-03.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="2"
                                        role="group" aria-label="3 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-04.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate swiper-slide-duplicate-prev"
                                        data-swiper-slide-index="3" role="group" aria-label="4 / 6"
                                        style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-05.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate swiper-slide-duplicate-active"
                                        data-swiper-slide-index="4" role="group" aria-label="5 / 6"
                                        style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-06.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate swiper-slide-duplicate-next"
                                        data-swiper-slide-index="5" role="group" aria-label="6 / 6"
                                        style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-07.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide" data-swiper-slide-index="0" role="group"
                                        aria-label="1 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-02.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide" data-swiper-slide-index="1" role="group"
                                        aria-label="2 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-03.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide" data-swiper-slide-index="2" role="group"
                                        aria-label="3 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-04.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-prev" data-swiper-slide-index="3"
                                        role="group" aria-label="4 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-05.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-active" data-swiper-slide-index="4"
                                        role="group" aria-label="5 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-06.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-next" data-swiper-slide-index="5"
                                        role="group" aria-label="6 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-07.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="0"
                                        role="group" aria-label="1 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-02.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="1"
                                        role="group" aria-label="2 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-03.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate" data-swiper-slide-index="2"
                                        role="group" aria-label="3 / 6" style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-04.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate swiper-slide-duplicate-prev"
                                        data-swiper-slide-index="3" role="group" aria-label="4 / 6"
                                        style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-05.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate swiper-slide-duplicate-active"
                                        data-swiper-slide-index="4" role="group" aria-label="5 / 6"
                                        style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-06.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="swiper-slide swiper-slide-duplicate swiper-slide-duplicate-next"
                                        data-swiper-slide-index="5" role="group" aria-label="6 / 6"
                                        style="width: 160px; margin-right: 30px;">
                                        <div class="rs-brand-item has-clip-path">
                                            <div class="rs-brand-thumb">
                                                <img src="assets/images/brand/brand-thumb-07.png" alt="image">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>



        <!-- counter area start -->
        <div class="rs-counter-area rs-counter-one section-space counter_sec">
            <div class="container">
                <div class="row  g-5 section-title-space justify-content-center top">
                    <div class="col-xl-12 col-lg-12">
                        <div class="rs-section-title-wrapper text-center">
                            <span class="rs-section-subtitle has-theme-orange">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15"
                                    fill="none">
                                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                                        fill="#1E2E5E"></path>
                                </svg>
                                Our Achievements
                            </span>
                            <h2 class="rs-section-title rs-split-text-enable split-in-fade"
                                style="perspective: 400px;">
                                Milestones That Define Our Success
                            </h2>
                        </div>
                    </div>

                </div>
                <div class="row g-5">
                    <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-6">
                        <div class="rs-counter-item">
                            <div class="rs-counter-inner">
                                <div class="rs-counter-number-wrapper">
                                    <span class="rs-counter-number odometer" data-count="5000">00</span>
                                    <span class="prefix">+</span>
                                </div>
                                <span class="rs-counter-title">Happy Clients</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-6">
                        <div class="rs-counter-item">
                            <div class="rs-counter-inner">
                                <div class="rs-counter-number-wrapper">
                                    <span class="rs-counter-number odometer" data-count="100">00</span>
                                    <span class="prefix">+</span>
                                </div>
                                <span class="rs-counter-title">Team Strength</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-6">
                        <div class="rs-counter-item">
                            <div class="rs-counter-inner">
                                <div class="rs-counter-number-wrapper">
                                    <span class="rs-counter-number odometer" data-count="27">00</span>
                                    <span class="prefix">+</span>
                                </div>
                                <span class="rs-counter-title">Years of Experience</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-6">
                        <div class="rs-counter-item">
                            <div class="rs-counter-inner">
                                <div class="rs-counter-number-wrapper">
                                    <span class="rs-counter-number odometer" data-count="20">00</span>
                                    <span class="prefix">+</span>
                                </div>
                                <span class="rs-counter-title">States Covered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- counter area end -->


    </main>
    <!-- Body main wrapper end -->


    <?php include ROOT_PATH . '/common/footer.php'; ?>


    <?php include ROOT_PATH . '/common/scripts.php'; ?>

    <!-- <script>
    new Swiper('.banner-swiper', {
        loop: true,
        effect: 'fade',
        speed: 1000,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
    </script> -->


    <script>
        // const bannerSwiper = new Swiper('.banner-swiper', {
        //     loop: true,
        //     speed: 1000,
        //     effect: 'creative',
        //     autoplay: {
        //         delay: 4000,
        //         disableOnInteraction: false,
        //     },
        //     creativeEffect: {
        //         prev: {
        //             translate: ['-20%', 0, -1],
        //             opacity: 0,
        //         },
        //         next: {
        //             translate: ['100%', 0, 0],
        //         },
        //     },
        //     pagination: {
        //         el: '.swiper-pagination',
        //         clickable: true,
        //     },
        //     navigation: {
        //         nextEl: '.swiper-button-next',
        //         prevEl: '.swiper-button-prev',
        //     },
        // });

        // const bannerSwiper = new Swiper('.banner-swiper', {
        //     loop: true,
        //     speed: 1000,
        //     effect: 'creative',
        //     grabCursor: true,
        //     creativeEffect: {
        //         prev: {
        //             translate: ['-100%', 0, 0],
        //             opacity: 0,
        //         },
        //         next: {
        //             translate: ['100%', 0, 0],
        //             opacity: 0,
        //         },
        //     },
        //     autoplay: {
        //         delay: 4000,
        //         disableOnInteraction: false,
        //     },
        //     pagination: {
        //         el: '.swiper-pagination',
        //         clickable: true,
        //     },
        //     navigation: {
        //         nextEl: '.swiper-button-next',
        //         prevEl: '.swiper-button-prev',
        //     },
        // });


        const bannerSwiper = new Swiper('.banner-swiper', {
            direction: 'vertical',
            loop: true,
            speed: 1000,
            effect: 'creative',
            grabCursor: true,
            // creativeEffect: {
            //     prev: {
            //         translate: [0, '-100%', 0],
            //         opacity: 0,
            //     },
            //     next: {
            //         translate: [0, '100%', 0],
            //         opacity: 0,
            //     },
            // },
            creativeEffect: {
                prev: {
                    translate: [0, '-100%', 0],
                    opacity: 0.7,
                },
                next: {
                    translate: [0, '100%', 0],
                    opacity: 0.7,
                },
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                direction: 'vertical'
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    </script>



    <!-- SweetAlert2 JS -->
    <script src=" https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@10.5.0/dist/sweetalert2.all.min.js">
    </script>

    <script>
        // $(document).ready(function() {
        //     $("#main-form").on('submit', function(e) {
        //         e.preventDefault();

        //         var formData = new FormData(this);
        //         var submitBtn = $("#main-form :submit");
        //         var originalBtnText = submitBtn.html();

        //         submitBtn.attr('disabled', true).html(
        //             "Please wait...");

        //         $.ajax({
        //             url: "mailer.php",
        //             method: "POST",
        //             data: formData,
        //             contentType: false,
        //             processData: false,
        //             success: function(response) {
        //                 submitBtn.attr(
        //                     'disabled',
        //                     false).html(
        //                     originalBtnText);
        //                 response = response
        //                     .trim()
        //                     .toLowerCase();

        //                 if (response ===
        //                     "success") {
        //                     $("#main-form")[0]
        //                         .reset();
        //                     Swal.fire({
        //                         title: "Success!",
        //                         text: "Message has been successfully sent.",
        //                         icon: "success",
        //                         timer: 1500,
        //                         showConfirmButton: false
        //                     });
        //                 } else {
        //                     Swal.fire({
        //                         title: "Error!",
        //                         text: "Something went wrong. Please try again.",
        //                         icon: "error"
        //                     });
        //                 }
        //             },
        //             error: function(xhr, status,
        //                 error) {
        //                 submitBtn.attr(
        //                     'disabled',
        //                     false).html(
        //                     originalBtnText);
        //                 Swal.fire({
        //                     title: "Error!",
        //                     text: "AJAX Error: " +
        //                         error,
        //                     icon: "error"
        //                 });
        //             }
        //         });
        //     });
        // });
    </script>


<script type="text/javascript">
$(document).ready(function () {

  function refreshCaptcha() {
    fetch('/regen-captcha.php') // use absolute path (fixes 404 issue)
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.text();
      })
      .then(txt => {
        $("#captchaValue2").text(txt);
      })
      .catch(err => {
        console.error("Captcha refresh failed:", err);
      });
  }

  // Refresh captcha on click
  $("#refreshCaptcha2").on("click", function (e) {
    e.preventDefault();
    refreshCaptcha();
  });

  // Form submit
  $("#main-form").on("submit", function (e) {
    e.preventDefault();

    let form = this;
    let formData = new FormData(form);
    let submitBtn = $(this).find("button[type=submit]");
    let oldText = submitBtn.text();

    submitBtn.prop("disabled", true).text("Please wait...");

    $.ajax({
      url: "mailer.php", // absolute path (safer)
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,

      success: function (response) {
        submitBtn.prop("disabled", false).text(oldText);

        let result = $.trim(response).toLowerCase();

        if (result === "success") {

          Swal.fire({
            title: "Success!",
            text: "Message has been successfully sent",
            icon: "success",
            confirmButtonText: "OK"
          }).then(() => {
            $("#main-form")[0].reset(); // fixed ID
            refreshCaptcha();
          });

        } else if (result === "fielderror") {

          Swal.fire({
            icon: "error",
            title: "Error",
            text: "All fields are required!"
          });

        } else if (result === "captchafail") {

          Swal.fire({
            icon: "error",
            title: "Invalid CAPTCHA",
            text: "Please try again!"
          }).then(() => {
            refreshCaptcha();
          });

        } else {

          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Error sending message!"
          });

        }
      },

      error: function (xhr, status, error) {
        submitBtn.prop("disabled", false).text(oldText);

        Swal.fire({
          icon: "error",
          title: "AJAX Error!",
          text: error || "Request failed!"
        });
      }
    });
  });

});
</script>



</body>






</html>