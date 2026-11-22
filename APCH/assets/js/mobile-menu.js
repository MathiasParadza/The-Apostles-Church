/*
 * Companion to assets/css/mobile-menu.css for pages whose header has its own
 * .mobile-toggle button. Each page keeps its own open/close script; this file
 * only:
 *  - marks .main-nav as .is-collapsed while the menu button is showing,
 *  - caps the opened menu's height to the space left on screen,
 *  - swaps the button icon between menu and close,
 *  - closes the menu on Escape.
 */
(function () {
    'use strict';

    function init() {
        var toggle = document.querySelector('.main-nav .mobile-toggle');
        var nav = toggle && toggle.closest('.main-nav');
        var menu = nav && nav.querySelector('.nav-menu');
        if (!menu) return;

        function isOpen() {
            return toggle.getAttribute('aria-expanded') === 'true' ||
                menu.classList.contains('active') || menu.classList.contains('open');
        }

        function sync() {
            var collapsed = window.getComputedStyle(toggle).display !== 'none';
            nav.classList.toggle('is-collapsed', collapsed);

            var open = collapsed && isOpen();
            var icon = toggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('bx-menu', !open);
                icon.classList.toggle('bx-x', open);
            }

            if (open) {
                // Room left between the top of the menu and the bottom of the screen.
                var top = menu.getBoundingClientRect().top;
                var room = Math.max(200, Math.floor(window.innerHeight - Math.max(top, 0) - 8));
                nav.style.setProperty('--mobile-menu-max-h', room + 'px');
            }
        }

        // Re-check once the page's own click handler has run.
        function later() { window.setTimeout(sync, 0); }
        toggle.addEventListener('click', later);
        new MutationObserver(later).observe(menu, { attributes: true, attributeFilter: ['class', 'style'] });
        new MutationObserver(later).observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-collapsed') && isOpen()) {
                toggle.click();
                toggle.focus();
            }
        });

        window.addEventListener('resize', sync);
        window.addEventListener('orientationchange', sync);
        sync();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
