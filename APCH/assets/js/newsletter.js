/*
 * Newsletter sign-up.
 * There is no mailing-list service connected yet, so instead of pretending to
 * subscribe people, each form opens a pre-filled email to the church
 * secretariat. Swap this for a real provider (e.g. Mailchimp, Brevo) later.
 */
(function () {
    var SECRETARIAT = 'apchsecretariat@gmail.com';

    function init() {
        var forms = document.querySelectorAll('form[data-newsletter]');
        Array.prototype.forEach.call(forms, function (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var input = form.querySelector('input[type="email"]');
                if (!input || !input.value || !input.checkValidity()) {
                    if (input) input.focus();
                    return;
                }
                var consent = form.querySelector('input[type="checkbox"][required]');
                if (consent && !consent.checked) {
                    consent.focus();
                    return;
                }
                var subject = 'Newsletter subscription';
                var body = 'Please add ' + input.value + ' to The Apostles\' Church newsletter.';
                window.location.href = 'mailto:' + SECRETARIAT +
                    '?subject=' + encodeURIComponent(subject) +
                    '&body=' + encodeURIComponent(body);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
