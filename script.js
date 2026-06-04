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

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initCounters();
        initContactCaptcha();
        initProcesosForm();
        initChatbot();
    });
})();
