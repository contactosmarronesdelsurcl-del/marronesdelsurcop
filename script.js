(function () {
    'use strict';

    function formatPT(n) {
        return Math.floor(n)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function countMeUp(el) {
        var final = parseInt(el.dataset.valor, 10);
        if (isNaN(final)) return;
        var duration = 3000;
        var start;

        function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            if (progress >= 1) {
                el.textContent = formatPT(final);
                return;
            }
            el.textContent = formatPT(progress * final);
            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    function initCounters() {
        var els = document.querySelectorAll('.mycontador');
        if (!els.length) return;

        var started = false;
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !started) {
                        started = true;
                        els.forEach(function (elem) {
                            countMeUp(elem);
                        });
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        var section = document.querySelector('.stats-section');
        if (section) io.observe(section);
    }

    function initMobileNav() {
        var trigger = document.querySelector('.mobile-menu-trigger');
        var panel = document.getElementById('nav-mobile');
        var shadow = document.getElementById('mobile-shadow');
        var closeBtn = document.getElementById('mobile-close');

        function open() {
            panel.classList.add('is-open');
            if (shadow) {
                shadow.hidden = false;
                shadow.classList.add('is-open');
            }
            panel.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function close() {
            panel.classList.remove('is-open');
            if (shadow) {
                shadow.classList.remove('is-open');
                shadow.hidden = true;
            }
            panel.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        if (trigger && panel) {
            trigger.addEventListener('click', open);
        }
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (shadow) shadow.addEventListener('click', close);
        if (panel) {
            panel.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', close);
            });
        }
    }

    function initContactCaptcha() {
        var form = document.getElementById('form-contacto');
        var qEl = document.getElementById('captcha-q');
        var inp = document.getElementById('captcha');
        if (!form || !qEl || !inp) return;

        function randomPair() {
            var a = Math.floor(Math.random() * 8) + 2;
            var b = Math.floor(Math.random() * 8) + 2;
            return { a: a, b: b, sum: a + b };
        }

        function refresh() {
            var p = randomPair();
            qEl.textContent = p.a + ' + ' + p.b + ' =';
            inp.dataset.expected = String(p.sum);
            inp.value = '';
        }

        refresh();

        form.addEventListener('submit', function (e) {
            var expected = inp.dataset.expected;
            var got = String(inp.value).trim();
            if (got !== expected) {
                e.preventDefault();
                alert('Comprueba el resultado de la operación.');
                refresh();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initCounters();
        initContactCaptcha();
    });
})();
