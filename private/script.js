document.addEventListener('DOMContentLoaded', function () {
    const PROFILES = {
        usager: { label: 'Usager', accueil: 'accueil-usager' },
        professionnel: { label: 'Professionnel', accueil: 'accueil-professionnel' },
        adherent: { label: 'Adhérent', accueil: 'accueil-adherent' }
    };

    const ADHERENT_ACCESS_CODE = 'UVS04';
    let adherentUnlocked = false;

    const SUBMENUS = {
        equipes: {
            none: [
                { label: 'Sous-page 1', target: 'equipes-none-1' },
                { label: 'Sous-page 2', target: 'equipes-none-2' }
            ],
            usager: [
                { label: 'Sous-page 1', target: 'equipes-usager-1' },
                { label: 'Sous-page 2', target: 'equipes-usager-2' }
            ],
            professionnel: [
                { label: 'Sous-page 1', target: 'equipes-professionnel-1' },
                { label: 'Sous-page 2', target: 'equipes-professionnel-2' }
            ]
        },
        services: {
            usager: [
                { label: 'Sous-page 1', target: 'services-usager-sous-1' },
                { label: 'Sous-page 2', target: 'services-usager-sous-2' }
            ],
            professionnel: [
                { label: 'Sous-page 1', target: 'services-professionnel-sous-1' },
                { label: 'Sous-page 2', target: 'services-professionnel-sous-2' }
            ]
        },
        assemblee: {
            adherent: [
                { label: 'Documents', target: 'ag-documents' },
                { label: 'Évènements à venir', target: 'ag-evenements' },
                { label: 'Mes propositions', target: 'ag-propositions' }
            ]
        }
    };

    const sections = document.querySelectorAll('.content-section');
    const submenuContainers = document.querySelectorAll('.has-submenu');
    const navAlwaysButtons = document.querySelectorAll('.nav-button[data-section]');
    const navProfileOnlyElements = document.querySelectorAll('.nav-profile-only');
    const navProOnlyElements = document.querySelectorAll('.nav-pro-only');
    const navAdherentOnlyElements = document.querySelectorAll('.nav-adherent-only');
    const navNotAdherentElements = document.querySelectorAll('.nav-not-adherent');
    const joinButton = document.getElementById('joinButton');
    const profileButtons = document.querySelectorAll('.profile-button');
    const profileSelectors = document.querySelectorAll('.profile-selector');
    const profileSwitcher = document.getElementById('profileSwitcher');

    let currentProfile = null; // null, 'usager' ou 'professionnel'

    const BASE_PATH = '/private';

    function profileFromPath(pathname) {
        const path = pathname.replace(/\/+$/, '') || '/';
        if (path === BASE_PATH + '/usager') return 'usager';
        if (path === BASE_PATH + '/professionnel') return 'professionnel';
        if (path === BASE_PATH + '/adherent') return 'adherent';
        return null;
    }

    function pathForProfile(profile) {
        return profile ? BASE_PATH + '/' + profile : BASE_PATH;
    }

    function showSection(sectionId) {
        sections.forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    function setActiveNavButton(sectionId) {
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.nav-subitem-row').forEach(row => row.classList.remove('active'));
        const btn = document.querySelector(`.nav-button[data-section="${sectionId}"]`);
        if (btn) {
            btn.classList.add('active');
            const row = btn.closest('.nav-subitem-row');
            if (row) row.classList.add('active');
        }
        markCategoryActive(sectionId);
    }

    // Met en surbrillance le menu catégorie (Qui sommes-nous ? / Assemblée générale)
    // correspondant à la section actuellement affichée
    function markCategoryActive(sectionId) {
        document.querySelectorAll('.nav-category-toggle').forEach(btn => btn.classList.remove('active'));

        let categoryKey = null;
        if (sectionId === 'identite' || sectionId.indexOf('equipes') === 0) {
            categoryKey = 'qui-sommes-nous';
        } else if (sectionId.indexOf('ag-') === 0) {
            categoryKey = 'assemblee';
        }
        if (!categoryKey) return;

        const container = document.querySelector(`.nav-item[data-submenu="${categoryKey}"]`);
        const toggle = container && container.querySelector(':scope > .nav-category-toggle');
        if (toggle) toggle.classList.add('active');
    }

    function renderProfileSwitcher() {
        profileSwitcher.innerHTML = '';
        if (!currentProfile) return;

        // Même design/comportement que les autres menus déroulants (Qui sommes-nous ?, etc.)
        const container = document.createElement('div');
        container.className = 'nav-item has-submenu';

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nav-button nav-category-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = `${PROFILES[currentProfile].label} <span class="nav-chevron-inline">▾</span>`;
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const willOpen = !container.classList.contains('open');
            closeSubmenus(willOpen ? container : null);
            if (willOpen) container.classList.add('open');
            toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });
        container.appendChild(toggle);

        const panel = document.createElement('div');
        panel.className = 'nav-dropdown';

        const accueilOption = document.createElement('button');
        accueilOption.type = 'button';
        accueilOption.textContent = 'Accueil';
        accueilOption.addEventListener('click', () => navigateToProfile(null));
        panel.appendChild(accueilOption);

        Object.keys(PROFILES).forEach(key => {
            if (key === currentProfile) return;
            const option = document.createElement('button');
            option.type = 'button';
            option.textContent = PROFILES[key].label;
            option.addEventListener('click', () => navigateToProfile(key));
            panel.appendChild(option);
        });

        container.appendChild(panel);
        profileSwitcher.appendChild(container);
    }

    function updateNavVisibility() {
        navProfileOnlyElements.forEach(el => {
            el.classList.toggle('nav-hidden', currentProfile !== 'usager' && currentProfile !== 'professionnel');
        });
        navProOnlyElements.forEach(el => {
            el.classList.toggle('nav-hidden', currentProfile !== 'professionnel');
        });
        navAdherentOnlyElements.forEach(el => {
            el.classList.toggle('nav-hidden', currentProfile !== 'adherent');
        });
        navNotAdherentElements.forEach(el => {
            el.classList.toggle('nav-hidden', currentProfile === 'adherent');
        });
        if (joinButton) {
            joinButton.classList.toggle('nav-hidden', currentProfile === 'adherent' && adherentUnlocked);
        }
        profileSelectors.forEach(el => {
            el.classList.toggle('profile-selector-hidden', !!currentProfile);
        });
        renderProfileSwitcher();
        renderSubmenus();
    }

    function syncSubmenuAria() {
        submenuContainers.forEach(container => {
            const trigger = container.querySelector(
                ':scope > .nav-category-toggle, :scope > .nav-item-buttons > .nav-chevron-toggle, :scope > .nav-subitem-row > .nav-chevron-toggle'
            );
            if (trigger) trigger.setAttribute('aria-expanded', container.classList.contains('open') ? 'true' : 'false');
        });
    }

    // Ferme tous les sous-menus ouverts, sauf `exceptContainer` et ses ancêtres
    // (permet de garder un menu parent ouvert quand on ouvre un sous-menu imbriqué)
    function closeSubmenus(exceptContainer) {
        document.querySelectorAll('.has-submenu.open').forEach(el => {
            if (exceptContainer && (el === exceptContainer || el.contains(exceptContainer))) return;
            el.classList.remove('open');
        });
        syncSubmenuAria();
    }

    function closeAllSubmenus() {
        closeSubmenus(null);
    }

    function renderSubmenus() {
        const profileKey = currentProfile || 'none';
        submenuContainers.forEach(container => {
            const menuKey = container.getAttribute('data-submenu');
            if (!SUBMENUS[menuKey]) return; // contenu statique (ex: "Qui sommes-nous ?"), on n'y touche pas
            const panel = container.querySelector('.nav-dropdown');
            const entries = SUBMENUS[menuKey][profileKey] || [];
            panel.innerHTML = '';
            entries.forEach(entry => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = entry.label;
                btn.addEventListener('click', function () {
                    document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.nav-subitem-row').forEach(row => row.classList.remove('active'));
                    showSection(entry.target);
                    markCategoryActive(entry.target);
                    closeAllSubmenus();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                panel.appendChild(btn);
            });
        });
    }

    // Ouverture/fermeture des sous-menus (survol desktop géré en CSS, clic/tactile ici)
    document.querySelectorAll('.nav-category-toggle, .nav-chevron-toggle').forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            const container = this.closest('.has-submenu');
            const willOpen = !container.classList.contains('open');
            closeSubmenus(willOpen ? container : null);
            if (willOpen) container.classList.add('open');
            syncSubmenuAria();
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.has-submenu')) {
            closeAllSubmenus();
        }
    });

    function render(profile, options) {
        options = options || {};

        // Quitter le profil Adhérent (même temporairement) invalide le code saisi :
        // il faudra le re-saisir en revenant sur cet espace.
        if (profile !== 'adherent') {
            adherentUnlocked = false;
        }

        currentProfile = profile;
        updateNavVisibility();
        closeAllSubmenus();

        let sectionToShow;
        if (profile === 'adherent' && !adherentUnlocked) {
            sectionToShow = 'adherent-code';
        } else if (options.sectionId) {
            sectionToShow = options.sectionId;
        } else if (profile) {
            sectionToShow = PROFILES[profile].accueil;
        } else {
            sectionToShow = 'identite';
        }

        showSection(sectionToShow);
        document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
        setActiveNavButton(sectionToShow);

        if (options.scroll !== false) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function navigateToProfile(profile) {
        const path = pathForProfile(profile);
        if (path !== window.location.pathname) {
            try {
                history.pushState({ profile: profile }, '', path);
            } catch (e) {
                // pushState peut échouer (ex: ouverture du fichier en file:// sans serveur local)
            }
        }
        render(profile);
    }

    // Boutons "Qui suis-je ?"
    profileButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            navigateToProfile(this.getAttribute('data-profile'));
        });
    });

    // Logo : retour à l'accueil (aucun profil sélectionné)
    const logoHome = document.getElementById('logoHome');
    if (logoHome) {
        logoHome.addEventListener('click', function () {
            navigateToProfile(null);
        });
    }

    // Lien "Mentions légales" dans le footer
    document.querySelectorAll('.footer-link-button[data-section]').forEach(btn => {
        btn.addEventListener('click', function () {
            const sectionId = this.getAttribute('data-section');
            document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.nav-subitem-row').forEach(row => row.classList.remove('active'));
            showSection(sectionId);
            markCategoryActive(sectionId);
            closeAllSubmenus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Boutons de navigation toujours visibles (Notre histoire, équipes, actualités, contact)
    navAlwaysButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const sectionId = this.getAttribute('data-section');
            setActiveNavButton(sectionId);
            showSection(sectionId);
            closeAllSubmenus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Boutons de navigation contextuels (services, modalités, partenaires)
    document.querySelectorAll('.nav-button[data-target-usager], .nav-button[data-target-professionnel]').forEach(btn => {
        btn.addEventListener('click', function () {
            if (!currentProfile) return;
            const targetId = this.getAttribute('data-target-' + currentProfile);
            if (!targetId) return;
            document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.nav-subitem-row').forEach(row => row.classList.remove('active'));
            this.classList.add('active');
            showSection(targetId);
            markCategoryActive(targetId);
            closeAllSubmenus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Formulaire de code d'accès Adhérent
    const adherentCodeForm = document.getElementById('adherentCodeForm');
    if (adherentCodeForm) {
        const adherentCodeInput = document.getElementById('adherentCodeInput');
        const adherentCodeError = document.getElementById('adherentCodeError');
        adherentCodeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (adherentCodeInput.value.trim().toUpperCase() === ADHERENT_ACCESS_CODE) {
                adherentUnlocked = true;
                adherentCodeError.hidden = true;
                adherentCodeInput.value = '';
                render('adherent', { sectionId: PROFILES.adherent.accueil });
            } else {
                adherentCodeError.hidden = false;
            }
        });
    }

    // Formulaire "Mes propositions" (pas encore relié à un envoi réel, juste un accusé visuel)
    const propositionForm = document.getElementById('propositionForm');
    if (propositionForm) {
        const propositionSuccess = document.getElementById('propositionSuccess');
        propositionForm.addEventListener('submit', function (e) {
            e.preventDefault();
            propositionSuccess.hidden = false;
            propositionForm.reset();
        });
    }

    window.addEventListener('popstate', function () {
        render(profileFromPath(window.location.pathname));
    });

    // Chargement initial en fonction de l'URL
    render(profileFromPath(window.location.pathname));
});
