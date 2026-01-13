// Gestion de la navigation entre les sections
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-button[data-section]');
    const sections = document.querySelectorAll('.content-section');
    const actuBtn = document.getElementById('actualites-btn');

    // Fonction pour afficher une section
    function showSection(sectionId) {
        // Retirer la classe active de toutes les sections et boutons
        sections.forEach(section => section.classList.remove('active'));
        navButtons.forEach(btn => btn.classList.remove('active'));

        // Ajouter la classe active à la section et au bouton correspondants
        const targetSection = document.getElementById(sectionId);
        const targetButton = document.querySelector(`[data-section="${sectionId}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
        }
        if (targetButton) {
            targetButton.classList.add('active');
        }

        // Scroll vers le haut du contenu
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Ajouter les événements de clic sur les boutons de navigation
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Gestion du bouton Actualités (redirection Facebook)
    if (actuBtn) {
        actuBtn.addEventListener('click', function() {
            // URL à remplacer par le lien de la page Facebook de l'association
            const facebookUrl = 'https://www.facebook.com/share/1DfZXjFBxr/'; // Remplacer par l'URL Facebook fournie par l'utilisateur
            
            if (facebookUrl === '#') {
                alert('Le lien vers les actualités sera bientôt disponible.');
            } else {
                window.open(facebookUrl, '_blank');
            }
        });
    }

    // Afficher la première section par défaut au chargement
    showSection('identite');
});
