document.addEventListener('DOMContentLoaded', function () {
    const PROFILES = {
        usager: { label: 'Usager', accueil: 'accueil-usager' },
        professionnel: { label: 'Professionnel', accueil: 'accueil-professionnel' }
    };

    const sections = document.querySelectorAll('.content-section');
    const navAlwaysButtons = document.querySelectorAll('.nav-button[data-section]');
    const navProfileButtons = document.querySelectorAll('.nav-button[data-target-usager], .nav-button[data-target-professionnel]');
    const navProOnlyButtons = document.querySelectorAll('.nav-button.nav-pro-only');
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
        navProfileButtons.forEach(btn => {
            btn.classList.toggle('nav-hidden', !currentProfile);
        });
        navProOnlyButtons.forEach(btn => {
            btn.classList.toggle('nav-hidden', currentProfile !== 'professionnel');
        });
        profileSelectors.forEach(el => {
            el.classList.toggle('profile-selector-hidden', !!currentProfile);
        });
        renderProfileSwitcher();
    }

    function render(profile, options) {
        options = options || {};
        currentProfile = profile;
        updateNavVisibility();

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    window.addEventListener('popstate', function () {
        render(profileFromPath(window.location.pathname));
    });

    // Chargement initial en fonction de l'URL
    render(profileFromPath(window.location.pathname));
});
