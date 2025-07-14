document.addEventListener('DOMContentLoaded', () => {
    const asignaturaCards = document.querySelectorAll('.asignatura-card');

    // Mapeo manual de prerrequisitos para facilitar la búsqueda.
    // La clave es el código del PRERREQUISITO, y el valor es un array de ramos
    // que TIENEN ese prerrequisito.
    const prerrequisitosMap = {
        // Semestre 1
        'AUD8041': ['AUD8011', 'AUD8042'],
        'AUD8051': ['AUD8052', 'AUD8071'],
        'AUD8061': ['AUD8062'],
        'AUD8091': ['AUD8092'],

        // Semestre 2
        'AUD8011': ['AUD8012'],
        'AUD8052': ['AUD8053', 'AUD8081'],
        'AUD8062': ['AUD8064', 'AUD8071'], // AUD8062 también es prerrequisito para AUD8071
        'AUD8092': ['AUD8093'],
        'CIG1001': ['CIG1002'],

        // Semestre 3
        'AUD8012': ['AUD8013', 'AUD8021', 'AUD8801'],
        'AUD8042': ['AUD8044'],
        'AUD8052': ['AUD8053', 'AUD8081'], // Duplicado, pero se mantiene para claridad del mapa
        'AUD8053': [], // No es prerrequisito directo de nada en el mapa
        'AUD8081': ['AUD8082'],
        'CIG1002': ['CIG1003'],

        // Semestre 4
        'AUD8013': ['AUD8014', 'AUD8015', 'AUD8031', 'AUD8802'],
        'AUD8044': ['AUD8045'],
        'AUD8021': ['AUD8025'],
        'AUD8071': ['AUD8054', 'AUD8072'],
        'AUD8081': ['AUD8082'], // Duplicado, mantener.
        'AUD8082': [], // No es prerrequisito directo de nada en el mapa
        'AUD8801': ['AUD8802'],
        'CIG1003': ['AUD8115'],

        // Semestre 5
        'AUD8014': ['AUD8015'],
        'AUD8045': ['AUD8047', 'AUD8031', 'AUD8033'],
        'AUD8025': [], // No es prerrequisito directo de nada en el mapa
        'AUD8054': [], // No es prerrequisito directo de nada en el mapa
        'AUD8064': ['AUD8065'],
        'AUD8115': [], // No es prerrequisito directo de nada en el mapa
        'AUD8802': ['AUD8803'],

        // Semestre 6
        'AUD8015': [], // No es prerrequisito directo de nada en el mapa
        'AUD8047': [], // No es prerrequisito directo de nada en el mapa
        'AUD8031': ['AUD8033', 'AUD8034', 'AUD8032'],
        'AUD8072': ['AUD8073'],
        'AUD8093': ['AUD8032'],

        // Semestre 7
        'AUD8033': [], // No es prerrequisito directo de nada en el mapa
        'AUD8034': ['AUD8803', 'AUD8018'],
        'AUD8073': ['AUD8074'],
        'AUD8065': ['AUD8024'],
        'AUD8032': ['AUD8036', 'AUD8035'],

        // Semestre 8
        'AUD8036': [], // No es prerrequisito directo de nada en el mapa
        'AUD8035': ['AUD8018'],
        'AUD8074': ['AUD8018'],
        'AUD8024': [], // No es prerrequisito directo de nada en el mapa
        'AUD8803': [], // No es prerrequisito directo de nada en el mapa

        // Semestre 9 (Metodología de la investigación como prerreq. de Seminario de Título)
        'AUD8422': ['AUD8702'],
        '244 créditos aprobados': ['AUD8422'], // Asumimos que los créditos son un 'prerreq' virtual para la búsqueda

        // Semestre 10
        'AUD8018': [], // No es prerrequisito directo de nada en el mapa
        'AUD8702': []  // No es prerrequisito directo de nada en el mapa
    };

    // Función para limpiar solo las clases de interactividad TEMPORALES
    function limpiarClasesTemporales() {
        asignaturaCards.forEach(card => {
            card.classList.remove('clickeado', 'se-oscurece', 'abre-ramo');
        });
    }

    // Función recursiva para resaltar los sucesores
    function resaltarSucesores(codigoRamo, visitados = new Set()) {
        if (visitados.has(codigoRamo)) {
            return; // Evitar ciclos infinitos
        }
        visitados.add(codigoRamo);

        const sucesoresDirectos = prerrequisitosMap[codigoRamo];
        if (sucesoresDirectos) {
            sucesoresDirectos.forEach(sucesorCodigo => {
                // IMPORTANT: Ensure the `sucesorCodigo` exactly matches the text content of the strong tag in your HTML.
                // For example, if your HTML has "<p><strong>Código:</strong> AUD8011</p>", then `sucesorCodigo` must be "AUD8011".
                const sucesorCard = document.querySelector(`.asignatura-card p strong:contains("${sucesorCodigo}")`);
                if (sucesorCard) {
                    sucesorCard.closest('.asignatura-card').classList.add('abre-ramo');
                    // Llamada recursiva para resaltar los sucesores de este sucesor
                    resaltarSucesores(sucesorCodigo, visitados);
                }
            });
        }
    }

    // Event Listener para cada tarjeta de asignatura
    asignaturaCards.forEach(card => {
        card.addEventListener('click', () => {
            const isApproved = card.classList.contains('aprobado');

            // 1. Gestionar el estado 'aprobado':
            // Si el ramo no está aprobado, lo marca como aprobado.
            // Si ya está aprobado, NO lo desmarca, solo procede con el resaltado.
            if (!isApproved) {
                card.classList.add('aprobado');
            }

            // 2. Limpiar clases temporales de todas las tarjetas
            limpiarClasesTemporales();

            // Obtener el código del ramo clicado
            const codigoElement = card.querySelector('p strong');
            if (!codigoElement) return;
            const codigoRamoClicado = codigoElement.textContent.trim();

            // 3. Marcar la tarjeta clicada como 'clickeado' para el resaltado temporal
            card.classList.add('clickeado');

            // 4. Oscurecer tarjetas que NO son la clicada Y NO están 'aprobado'
            asignaturaCards.forEach(otherCard => {
                if (otherCard !== card && !otherCard.classList.contains('aprobado')) {
                    otherCard.classList.add('se-oscurece');
                }
            });

            // 5. Resaltar los sucesores y sus cadenas (añadirá 'abre-ramo')
            resaltarSucesores(codigoRamoClicado);
        });
    });

    // Polyfill básico para ':contains'
    (function (originalQuerySelectorAll) {
        document.querySelectorAll = function(selector) {
            if (selector.includes(':contains(')) {
                const parts = selector.split(':contains(');
                const baseSelector = parts[0];
                const textToFind = parts[1].slice(0, -1).replace(/\"/g, '').replace(/'/g, '');
                const elements = originalQuerySelectorAll.call(this, baseSelector);
                return Array.from(elements).filter(el => el.textContent.includes(textToFind));
            }
            return originalQuerySelectorAll.call(this, selector);
        };
    })(document.querySelectorAll);
});
