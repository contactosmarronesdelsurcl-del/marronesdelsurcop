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
            trigger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            var firstLink = panel.querySelector('a');
            if (firstLink) firstLink.focus();
        }

        function close() {
            panel.classList.remove('is-open');
            if (shadow) {
                shadow.classList.remove('is-open');
                shadow.hidden = true;
            }
            panel.setAttribute('aria-hidden', 'true');
            if (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
                trigger.focus();
            }
            document.body.style.overflow = '';
        }

        if (trigger && panel) {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.addEventListener('click', open);
        }
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (shadow) shadow.addEventListener('click', close);
        if (panel) {
            panel.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', close);
            });
        }
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && panel && panel.classList.contains('is-open')) {
                close();
            }
        });
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
                return;
            }

            // Permitir que Formspree maneje el envío
            e.preventDefault();

            var formData = new FormData(form);
            var xhr = new XMLHttpRequest();
            
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        alert('Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
                        form.reset();
                        refresh();
                    } else {
                        alert('Error al enviar el mensaje. Intenta de nuevo.');
                    }
                }
            };

            xhr.open('POST', form.action, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(formData);
        });
    }

    function initProcesosForm() {
        var form = document.getElementById('form-procesos');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var formData = new FormData(form);
            var xhr = new XMLHttpRequest();
            
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        alert('Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
                        form.reset();
                    } else {
                        alert('Error al enviar el mensaje. Intenta de nuevo.');
                    }
                }
            };

            xhr.open('POST', form.action, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(formData);
        });
    }

    function initChatbot() {
        var widget = document.querySelector('.chatbot-widget');
        if (!widget) return;

        var toggle = widget.querySelector('.chatbot-toggle');
        var panel = widget.querySelector('.chatbot-panel');
        var closeBtn = widget.querySelector('.chatbot-close');
        var form = widget.querySelector('.chatbot-form');
        var input = widget.querySelector('.chatbot-input');
        var body = widget.querySelector('.chatbot-body');

        function scrollBottom() {
            body.scrollTop = body.scrollHeight;
        }

        function appendMessage(type, text) {
            var message = document.createElement('div');
            message.className = 'chatbot-message ' + type;
            message.textContent = text;
            body.appendChild(message);
            scrollBottom();
        }

        function getResponse(text) {
                var lower = String(text).trim().toLowerCase();
                if (!lower) return 'Escribe tu consulta para que pueda ayudarte.';
                if (/hola|buenas|buen/.test(lower)) return 'Hola 👋, soy tu asistente. ¿Necesitas ayuda con plantas, procesos o asesoría?';

                // Si el usuario responde "sí" ofrecer información genérica sobre asesorías y proporcionar el correo
                if (/^s(i|í)(\b|\s|!|\.)/.test(lower)) return 'Ofrecemos asesorías técnicas generales: planificación de plantación, manejo sanitario, riego y manejo poscosecha. Para consultas más detalladas puedes escribir a contactosmarronesdelsur.cl@gmail.com y nuestros expertos te responderán.';
                if (/contacto|tel|whatsapp|correo/.test(lower)) return 'Puedes escribirnos aquí o usar el formulario de contacto para recibir respuesta personalizada.';
                if (/asesor|asesoría|asesoria|servicio/.test(lower)) return 'Ofrecemos asesoría técnica y seguimiento de plantaciones con enfoque en calidad y seguridad agrícola.';

                // Preguntas sobre castaña / cosecha
                if (/castaño|castanas|castañas|castana/.test(lower) && /cosech|recolec|recolect|cosecha|recolección/.test(lower)) {
                    return 'Información general sobre cosecha de castañas: la recolección suele realizarse cuando los erizos se abren y las castañas caen o están fácilmente extraíbles. Se recolecta a mano o con equipos mecánicos ligeros, se limpia y se selecciona el fruto. Después es habitual realizar un secado/curado moderado para reducir humedad y evitar hongos, y almacenar en lugares frescos y ventilados.';
                }

                if (/cosech|recolec|recolect|recolección/.test(lower)) {
                    return 'Consejos de cosecha generales: recoge cuando el fruto esté maduro y seco por la mañana, evita el fruto dañado, seca a temperatura y ventilación controladas, y almacena en sacos o contenedores en lugar fresco para conservar calidad.';
                }

                if (/plantas|vivero|plantación|plantacion|plantas|castaño/.test(lower)) {
                    return 'Sobre producción y vivero: el éxito comienza con elegir variedad adecuada, suelo bien drenado, marco de plantación correcto y plantas sanas del vivero. La aclimatación, riego inicial y nutrición balanceada son claves en los primeros años.';
                }

                if (/poda|sanidad|plagas|enfermedad|control/.test(lower)) {
                    return 'Manejo sanitario: realice monitoreos periódicos para identificar plagas y enfermedades; aplique medidas culturales primero (rotación, limpieza, poda) y consulte productos autorizados y recomendaciones técnicas para tratamientos específicos.';
                }

                if (/riego|nutrici|fertili|fertilizante/.test(lower)) {
                    return 'Riego y nutrición: establezca riegos según fase fenológica y tipo de suelo; evite encharcamientos. Haga análisis de suelo y foliares para definir fertilizaciones equilibradas según necesidades del cultivo.';
                }

                // Respuesta por defecto para temas agrícolas
                if (/agricol|agricul|campo|finca|producción|produccion/.test(lower)) {
                    return 'En general, combinamos buenas prácticas de campo, planificación y seguimiento técnico para mejorar la rentabilidad y la salud del cultivo. Si quieres, dime un tema concreto (riego, poda, cosecha, sanidad).';
                }

                return 'No tengo la exactitud para responder eso, pero puedes consultar a nuestros expertos en el correo o número de contacto.';
        }

        toggle.addEventListener('click', function () {
            var isHidden = panel.hasAttribute('hidden');
            if (isHidden) {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                input.focus();
            } else {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        closeBtn.addEventListener('click', function () {
            panel.setAttribute('hidden', '');
            toggle.setAttribute('aria-expanded', 'false');
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = input.value.trim();
            if (!value) return;
            appendMessage('user', value);
            input.value = '';
            window.setTimeout(function () {
                appendMessage('bot', getResponse(value));
            }, 300);
        });
    }

    function initMethodologySlider() {
        var wrap = document.querySelector('.methodology-wrap');
        if (!wrap) return;

        var track = wrap.querySelector('.methodology-grid');
        var prev = wrap.querySelector('.method-nav.prev');
        var next = wrap.querySelector('.method-nav.next');
        var slides = Array.prototype.slice.call(wrap.querySelectorAll('.method-card'));
        var dots = Array.prototype.slice.call(wrap.querySelectorAll('.methodology-pagination button'));
        var autoplay = wrap.querySelector('.method-autoplay');
        if (!track || !prev || !next || !slides.length || dots.length !== slides.length || !autoplay) return;

        var activeIndex = 0;
        var angle = 360 / slides.length;
        var timer = null;
        var isVisible = true;
        var isPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var hasStartedRotation = false;

        function layoutCylinder() {
            var radius = slides[0].offsetWidth / (2 * Math.tan(Math.PI / slides.length));
            slides.forEach(function (slide, index) {
                slide.style.transform = 'translateX(-50%) rotateY(' + (index * angle) + 'deg) translateZ(' + radius + 'px)';
            });
            render();
        }

        function render() {
            track.style.transform = 'rotateY(' + (-activeIndex * angle) + 'deg)';
            slides.forEach(function (slide, index) {
                var offset = (index - activeIndex + slides.length) % slides.length;
                var faceAngle = Math.min(offset, slides.length - offset) * angle;
                var light = Math.max(0, Math.cos(faceAngle * Math.PI / 180));
                slide.style.opacity = String(0.28 + light * 0.72);
                slide.style.filter = 'brightness(' + (0.48 + light * 0.52) + ')';
                slide.setAttribute('aria-hidden', index === activeIndex ? 'false' : 'true');
            });
            dots.forEach(function (dot, index) {
                dot.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
            });
        }

        function moveTo(index) {
            activeIndex = (index + slides.length) % slides.length;
            hasStartedRotation = true;
            render();
            updateTimer();
        }

        function stopTimer() {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
        }

        function updateTimer() {
            stopTimer();
            if (!isPaused && isVisible && !document.hidden) {
                timer = window.setTimeout(function () {
                    moveTo(activeIndex + 1);
                }, hasStartedRotation ? 5500 : 500);
            }
        }

        function setPaused(paused) {
            isPaused = paused;
            autoplay.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
            autoplay.setAttribute('aria-pressed', paused ? 'true' : 'false');
            autoplay.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
            updateTimer();
        }

        prev.addEventListener('click', function () {
            moveTo(activeIndex - 1);
        });
        next.addEventListener('click', function () {
            moveTo(activeIndex + 1);
        });
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                moveTo(index);
            });
        });
        autoplay.addEventListener('click', function () {
            setPaused(!isPaused);
        });
        wrap.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                moveTo(activeIndex - 1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                moveTo(activeIndex + 1);
            }
        });

        var startX = null;
        wrap.addEventListener('touchstart', function (event) {
            startX = event.changedTouches[0].clientX;
        }, { passive: true });
        wrap.addEventListener('touchend', function (event) {
            if (startX === null) return;
            var distance = event.changedTouches[0].clientX - startX;
            if (Math.abs(distance) > 45) {
                moveTo(activeIndex + (distance < 0 ? 1 : -1));
            }
            startX = null;
        }, { passive: true });

        if ('ResizeObserver' in window) {
            var resizeObserver = new ResizeObserver(layoutCylinder);
            resizeObserver.observe(slides[0]);
        } else {
            window.addEventListener('resize', layoutCylinder);
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                isVisible = entries[0].isIntersecting;
                updateTimer();
            }, { threshold: 0.2 });
            observer.observe(wrap);
        }

        document.addEventListener('visibilitychange', updateTimer);
        layoutCylinder();
        updateTimer();
    }

    function initGalleryCarousel() {
        var carousel = document.querySelector('.gallery-carousel');
        if (!carousel) return;

        var track = carousel.querySelector('.gallery-track');
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.gallery-cell'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.gallery-pagination button'));
        var previous = carousel.querySelector('.gallery-prev');
        var next = carousel.querySelector('.gallery-next');
        var autoplay = carousel.querySelector('.gallery-autoplay');
        if (!track || !slides.length || dots.length !== slides.length || !previous || !next || !autoplay) return;

        var activeIndex = 0;
        var panelAngle = 52;
        var radius = 0;
        var timer = null;
        var isVisible = true;
        var isPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var hasStartedRotation = false;

        function render() {
            slides.forEach(function (slide, index) {
                var offset = (index - activeIndex + slides.length) % slides.length;
                if (offset > slides.length / 2) offset -= slides.length;
                var faceAngle = offset * panelAngle;
                var light = Math.max(0, Math.cos(faceAngle * Math.PI / 180));
                slide.style.transform = 'translate(-50%, -50%) rotateY(' + faceAngle + 'deg) translateZ(' + radius + 'px)';
                slide.style.opacity = String(0.42 + light * 0.58);
                slide.style.filter = 'brightness(' + (0.62 + light * 0.38) + ')';
                slide.setAttribute('aria-hidden', index === activeIndex ? 'false' : 'true');
            });
            dots.forEach(function (dot, index) {
                dot.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
            });
        }

        function moveTo(index) {
            activeIndex = (index + slides.length) % slides.length;
            hasStartedRotation = true;
            render();
            updateTimer();
        }

        function stopTimer() {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
        }

        function updateTimer() {
            stopTimer();
            if (!isPaused && isVisible && !document.hidden) {
                timer = window.setTimeout(function () {
                    moveTo(activeIndex + 1);
                }, hasStartedRotation ? 5500 : 500);
            }
        }

        function setPaused(paused) {
            isPaused = paused;
            autoplay.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
            autoplay.setAttribute('aria-pressed', paused ? 'true' : 'false');
            autoplay.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
            updateTimer();
        }

        previous.addEventListener('click', function () {
            moveTo(activeIndex - 1);
        });
        next.addEventListener('click', function () {
            moveTo(activeIndex + 1);
        });
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                moveTo(index);
            });
        });
        autoplay.addEventListener('click', function () {
            setPaused(!isPaused);
        });
        carousel.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                moveTo(activeIndex - 1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                moveTo(activeIndex + 1);
            }
        });

        var startX = null;
        carousel.addEventListener('touchstart', function (event) {
            startX = event.changedTouches[0].clientX;
        }, { passive: true });
        carousel.addEventListener('touchend', function (event) {
            if (startX === null) return;
            var distance = event.changedTouches[0].clientX - startX;
            if (Math.abs(distance) > 45) {
                moveTo(activeIndex + (distance < 0 ? 1 : -1));
            }
            startX = null;
        }, { passive: true });

        function layoutCylinder() {
            radius = slides[0].offsetWidth / (2 * Math.tan(panelAngle * Math.PI / 360));
            render();
        }

        layoutCylinder();
        if ('ResizeObserver' in window) {
            var resizeObserver = new ResizeObserver(layoutCylinder);
            resizeObserver.observe(slides[0]);
        } else {
            window.addEventListener('resize', layoutCylinder);
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                isVisible = entries[0].isIntersecting;
                updateTimer();
            }, { threshold: 0.2 });
            observer.observe(carousel);
        }
        document.addEventListener('visibilitychange', updateTimer);
        document.addEventListener('visibilitychange', updateTimer);
        document.addEventListener('visibilitychange', updateTimer);
        render();
        updateTimer();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initCounters();
        initContactCaptcha();
        initProcesosForm();
        initChatbot();
        initMethodologySlider();
        initGalleryCarousel();
    });
})();
