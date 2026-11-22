/*
 * Adds a menu button to the simple inner-page header (.main-nav with a
 * ul.nav-menu) so the links fold away on narrow screens. Styling lives in
 * assets/css/mobile-nav.css.
 */
(function () {
    'use strict';

    function init() {
        var nav = document.querySelector('.main-nav');
        var menu = nav && nav.querySelector('.nav-menu');
        if (!menu || nav.querySelector('.mobile-nav-toggle')) return;

        if (!menu.id) menu.id = 'main-nav-menu';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'mobile-nav-toggle';
        toggle.setAttribute('aria-controls', menu.id);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.innerHTML = '<i class="bx bx-menu" aria-hidden="true"></i>';
        nav.insertBefore(toggle, menu);

        function setOpen(open) {
            nav.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            toggle.firstChild.className = 'bx ' + (open ? 'bx-x' : 'bx-menu');
        }

        toggle.addEventListener('click', function () {
            setOpen(!nav.classList.contains('is-open'));
        });

        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });

        var wide = window.matchMedia('(min-width: 992px)');
        var onChange = function () { if (wide.matches) setOpen(false); };
        if (wide.addEventListener) wide.addEventListener('change', onChange);
        else if (wide.addListener) wide.addListener(onChange);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
