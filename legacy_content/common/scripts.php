  <!-- JS here -->
  <script src="<?php echo BASE_URL . 'assets/js/vendor/jquery-3.7.1.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/waypoints.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/vendor/bootstrap.bundle.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/meanmenu.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/swiper.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/wow.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/vendor/magnific-popup.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/vendor/isotope.pkgd.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/vendor/imagesloaded.pkgd.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/nice-select.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/jarallax.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/vendor/ajax-form.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/easypie.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/headding-title.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/lenis.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/gsap.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/rs-anim-int.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/rs-scroll-trigger.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/rs-splitText.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/jquery.lettering.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/parallax-effect.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/jquery.appear.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/marquee.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/chart.umd.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/plugins/nouislider.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/vendor/purecounter.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/vendor/odometer.min.js'; ?>"></script>
  <script src="<?php echo BASE_URL . 'assets/js/main.js'; ?>"></script>


  <!-- <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script> -->



  <!-- <script>
document.addEventListener("DOMContentLoaded", function() {
    const counters = document.querySelectorAll(".rs-counter-number");

    counters.forEach(counter => {
        const finalCount = counter.getAttribute('data-count');
        const odometerInstance = new Odometer({
            el: counter,
            value: 0,
            duration: 3000
        });

        setTimeout(() => {
            counter.innerHTML = finalCount;
        }, 500);
    });
});
  </script> -->



  <script>
window.addEventListener('scroll', function() {
    const stickyIcons = document.getElementById('sticky-icon');

    if (window.scrollY > 350) {
        stickyIcons.style.opacity = '1';
        stickyIcons.style.visibility = 'visible';
    } else {
        stickyIcons.style.opacity = '0';
        stickyIcons.style.visibility = 'hidden';
    }
});
  </script>


  <script>
window.addEventListener('scroll', function() {
    const logo = document.querySelector('.rs-header-logo img');
    if (window.scrollY > 50) {
        logo.src = '<?php echo BASE_URL . "assets/images/logo/msc_logo_without_bg.png"; ?>';
    } else {
        logo.src = '<?php echo BASE_URL . "assets/images/logo/msc_logo_without_bg.png"; ?>';
    }
});
  </script>


  <script>
document.querySelectorAll('.sidebar-tabs a').forEach(link => {
    const currentPage = window.location.pathname.split("/").pop();
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});
  </script>



  <script>
window.addEventListener("scroll", function() {
    const feedbackBtn = document.getElementById("feedbackBtn");
    if (window.scrollY > 200) {
        feedbackBtn.style.display = "block";
    } else {
        feedbackBtn.style.display = "none";
    }
});
  </script>
  
  

<script>
  var swiper = new Swiper(".myVideoSwiper", {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 3000,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    // Responsive
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1200: { slidesPerView: 3 }
    }
  });
</script>


<script>
$(document).ready(function() {
    $('.pricelist-tabs li').click(function() {
        var tab_id = $(this).data('tab');

        // Remove active class from tabs
        $('.pricelist-tabs li').removeClass('active');
        $(this).addClass('active');

        // Hide all tab panes and show the selected
        $('.tab-pane').removeClass('active');
        $('#' + tab_id).addClass('active');
    });
});
</script>

<script>
function openTab(evt, tabName) {
  document.querySelectorAll('.tab-panel').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabName).classList.add('active');
  evt.currentTarget.classList.add('active');
}
</script>

<script>
let lastScrollTop = 0;
const header = document.getElementById('header-sticky');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) { 
        // If user scrolled down 50px or more → hide header
        header.style.top = "-120px"; // Adjust -120px to your header height
    } else {
        // If at top → show header
        header.style.top = "0";
    }

    lastScrollTop = scrollTop;
});
</script>



<!-- <script>
    var lastScrollTop = 0;
    $(window).on('scroll', function() {
        var scrollTop = $(this).scrollTop();

        if (scrollTop > lastScrollTop && scrollTop > 100){
            $('#header-sticky').slideUp(200);
        } else {
            $('#header-sticky').slideDown(200);
        }

        lastScrollTop = scrollTop;
    });

</script> -->

<!-- <script>
$(document).ready(function () {

    $('.mega-toggle').on('click', function (e) {
        e.preventDefault();

        // Close other mega menus
        $('.mega-submenu').not($(this).next()).slideUp(200);

        // Toggle current mega menu
        $(this).next('.mega-submenu').slideToggle(250);
    });

    // Close when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.mega-menu').length) {
            $('.mega-submenu').slideUp(200);
        }
    });

});
</script> -->
