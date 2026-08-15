document.addEventListener('DOMContentLoaded', function () {
    const PROFILES = {
        usager: { label: 'Usager', accueil: 'accueil-usager' },
        professionnel: { label: 'Professionnel', accueil: 'accueil-professionnel' }
    };

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
        }
    };

    const sections = document.querySelectorAll('.content-section');
    const submenuContainers = document.querySelectorAll('.has-submenu');
    const navAlwaysButtons = document.querySelectorAll('.nav-button[data-section]');
    const navProfileOnlyElements = document.querySelectorAll('.nav-profile-only');
    const navProOnlyElements = document.querySelectorAll('.nav-pro-only');
    const profileButtons = document.querySelectorAll('.profile-button');
    const profileSelectors = document.querySelectorAll('.profile-selector');
    const profileSwitcher = document.getElementById('profileSwitcher');

    let currentProfile = null; // null, 'usager' ou 'professionnel'

    function profileFromPath(pathname) {
        const path = pathname.replace(/\/+$/, '');
        if (path === '/usager') return 'usager';
        if (path === '/professionnel') return 'professionnel';
        return null;
    }

    function pathForProfile(profile) {
        return profile ? '/' + profile : '/';
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
        const btn = document.querySelector(`.nav-button[data-section="${sectionId}"]`);
        if (btn) btn.classList.add('active');
        markCategoryActive(sectionId);
    }

    // Met en surbrillance "Qui sommes-nous ?" quand une de ses sous-pages est affichée
    function markCategoryActive(sectionId) {
        const categoryToggle = document.querySelector('.nav-category-toggle');
        if (!categoryToggle) return;
        const isQuiSommesNous = sectionId === 'identite' || sectionId.indexOf('equipes') === 0;
        categoryToggle.classList.toggle('active', isQuiSommesNous);
    }

    function renderProfileSwitcher() {
        profileSwitcher.innerHTML = '';
        if (!currentProfile) return;

        const select = document.createElement('select');
        select.className = 'profile-switch-select';

        const placeholderOption = document.createElement('option');
        placeholderOption.textContent = PROFILES[currentProfile].label;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.hidden = true;
        select.appendChild(placeholderOption);

        const accueilOption = document.createElement('option');
        accueilOption.value = '';
        accueilOption.textContent = 'Accueil';
        select.appendChild(accueilOption);

        Object.keys(PROFILES).forEach(key => {
            if (key === currentProfile) return;
            const option = document.createElement('option');
            option.value = key;
            option.textContent = PROFILES[key].label;
            select.appendChild(option);
        });

        select.addEventListener('change', function () {
            navigateToProfile(this.value || null);
        });

        profileSwitcher.appendChild(select);
    }

    function updateNavVisibility() {
        navProfileOnlyElements.forEach(el => {
            el.classList.toggle('nav-hidden', !currentProfile);
        });
        navProOnlyElements.forEach(el => {
            el.classList.toggle('nav-hidden', currentProfile !== 'professionnel');
        });
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
        currentProfile = profile;
        updateNavVisibility();
        closeAllSubmenus();

        let sectionToShow;
        if (options.sectionId) {
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
            this.classList.add('active');
            showSection(targetId);
            markCategoryActive(targetId);
            closeAllSubmenus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    window.addEventListener('popstate', function () {
        render(profileFromPath(window.location.pathname));
    });

    // Chargement initial en fonction de l'URL
    render(profileFromPath(window.location.pathname));
});
