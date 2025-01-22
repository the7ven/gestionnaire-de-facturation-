// Initialisation des données dans le localStorage
if (!localStorage.getItem('articles')) {
    localStorage.setItem('articles', JSON.stringify([]));
}
if (!localStorage.getItem('factures')) {
    localStorage.setItem('factures', JSON.stringify([]));
}
if (!localStorage.getItem('dernierNumeroFacture')) {
    localStorage.setItem('dernierNumeroFacture', '0');
}

// Gestion du panier actuel
let panierActuel = [];

// Fonctions de gestion des articles
function ajouterArticle() {
    const nom = document.getElementById('article-name').value;
    const prix = parseFloat(document.getElementById('article-price').value);
    const categorie = document.getElementById('article-category').value;

    if (!nom || !prix) {
        showToast("Veuillez remplir tous les champs", "error");
        return;
    }

    const articles = JSON.parse(localStorage.getItem('articles'));
    const nouvelArticle = {
        id: Date.now(),
        nom,
        prix,
        categorie
    };

    articles.push(nouvelArticle);
    localStorage.setItem('articles', JSON.stringify(articles));

    document.getElementById('article-name').value = '';
    document.getElementById('article-price').value = '';
    
    showToast("Article ajouté avec succès", "success");
    chargerArticles();
}

function supprimerArticle(id) {
    const articles = JSON.parse(localStorage.getItem('articles'));
    const index = articles.findIndex(a => a.id === id);
    articles.splice(index, 1);
    localStorage.setItem('articles', JSON.stringify(articles));
    chargerArticles();
    showToast("Article supprimé avec succès", "success");
}

function chargerArticles() {
    const articles = JSON.parse(localStorage.getItem('articles'));
    const tableBody = document.querySelector('#articles-list tbody');
    const articlesTable = document.querySelector('#articles-table tbody');

    // Mise à jour de la liste des articles dans l'onglet gestion
    tableBody.innerHTML = articles.map(article => `
        <tr>
            <td>${article.nom}</td>
            <td>${article.prix.toFixed(2)} €</td>
            <td>${article.categorie}</td>
            <td>
                <button class="btn-icon" onclick="ouvrirModalEdition(${article.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="supprimerArticle(${article.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Mise à jour de la liste des articles disponibles
    articlesTable.innerHTML = articles.map(article => `
        <tr>
            <td>${article.nom}</td>
            <td>${article.prix.toFixed(2)} €</td>
            <td>
                <button class="btn-icon" onclick="ajouterAuPanier(${article.id})">
                    <i class="fas fa-plus"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Gestion du panier
function ajouterAuPanier(articleId) {
    const articles = JSON.parse(localStorage.getItem('articles'));
    const article = articles.find(a => a.id === articleId);
    
    panierActuel.push({...article, quantite: 1});
    mettreAJourPanier();
    showToast("Article ajouté au panier", "success");
}

function retirerDuPanier(index) {
    panierActuel.splice(index, 1);
    mettreAJourPanier();
}

function mettreAJourPanier() {
    const cartDiv = document.getElementById('current-cart');
    const total = panierActuel.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    
    cartDiv.innerHTML = panierActuel.map((item, index) => `
        <div class="cart-item">
            <span>${item.nom} (${item.quantite}x)</span>
            <span>${(item.prix * item.quantite).toFixed(2)} €</span>
            <button class="btn-icon" onclick="retirerDuPanier(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

        document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Gestion des factures
function finaliserFacture() {
    const tableNumber = document.getElementById('table-number').value;
    if (!tableNumber) {
        showToast("Veuillez entrer un numéro de table", "error");
        return;
    }
    if (panierActuel.length === 0) {
        showToast("Le panier est vide", "error");
        return;
    }

    const factures = JSON.parse(localStorage.getItem('factures'));
    const numeroFacture = parseInt(localStorage.getItem('dernierNumeroFacture')) + 1;
    
    const nouvelleFacture = {
        id: numeroFacture,
        table: tableNumber,
        date: new Date().toISOString(),
        articles: panierActuel,
        total: panierActuel.reduce((sum, item) => sum + (item.prix * item.quantite), 0)
    };

    factures.push(nouvelleFacture);
    localStorage.setItem('factures', JSON.stringify(factures));
    localStorage.setItem('dernierNumeroFacture', numeroFacture.toString());

    // Réinitialisation du panier
    panierActuel = [];
    mettreAJourPanier();
        document.getElementById('table-number').value = '';
    
    showToast("Facture finalisée avec succès", "success");
    chargerHistorique();
}

function chargerHistorique() {
    const factures = JSON.parse(localStorage.getItem('factures'));
    const tableBody = document.querySelector('#historique-table tbody');
    
    tableBody.innerHTML = factures.map(facture => `
        <tr>
            <td>${facture.id}</td>
            <td>${facture.table}</td>
            <td>${moment(facture.date).format('DD/MM/YYYY HH:mm')}</td>
            <td>${facture.total.toFixed(2)} €</td>
            <td>
                <button class="btn-icon" onclick="afficherDetailFacture(${facture.id})">
                    <i class="fas fa-eye"></i>
                </button>
                </td>
                        </tr>
    `).join('');
}

function afficherDetailFacture(factureId) {
    const factures = JSON.parse(localStorage.getItem('factures'));
    const facture = factures.find(f => f.id === factureId);
    
    const modal = document.getElementById('factureModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h2>Facture N°${facture.id}</h2>
        <p>Table: ${facture.table}</p>
        <p>Date: ${moment(facture.date).format('DD/MM/YYYY HH:mm')}</p>
        <div class="facture-details">
            ${facture.articles.map(article => `
                <div class="facture-item">
                    <span>${article.nom} (${article.quantite}x)</span>
                    <span>${(article.prix * article.quantite).toFixed(2)} €</span>
                </div>
            `).join('')}
        </div>
        <div class="facture-total">
            <strong>Total: ${facture.total.toFixed(2)} €</strong>
        </div>
    `;
    
    modal.style.display = "block";
}

// Gestion des modales
function ouvrirModalEdition(articleId) {
    const articles = JSON.parse(localStorage.getItem('articles'));
    const article = articles.find(a => a.id === articleId);
    
    document.getElementById('edit-article-id').value = article.id;
    document.getElementById('edit-article-name').value = article.nom;
    document.getElementById('edit-article-price').value = article.prix;
    document.getElementById('edit-article-category').value = article.categorie;
    
    document.getElementById('editArticleModal').style.display = "block";
}

function closeEditModal() {
    document.getElementById('editArticleModal').style.display = "none";
}

function sauvegarderArticle() {
    const id = parseInt(document.getElementById('edit-article-id').value);
    const nom = document.getElementById('edit-article-name').value;
    const prix = parseFloat(document.getElementById('edit-article-price').value);
    const categorie = document.getElementById('edit-article-category').value;

    const articles = JSON.parse(localStorage.getItem('articles'));
    const index = articles.findIndex(a => a.id === id);
    
    articles[index] = { id, nom, prix, categorie };
    localStorage.setItem('articles', JSON.stringify(articles));
    
        closeEditModal();
    chargerArticles();
    showToast("Article modifié avec succès", "success");
}

// Gestion des onglets
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
    
    if (tabId === 'historique') {
        chargerHistorique();
    }
}

// Fonction utilitaire pour afficher les notifications
function showToast(message, type = "info") {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: type === "error" ? "#ff4444" : "#00C851",
    }).showToast();
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    chargerArticles();
    chargerHistorique();
    
    // Gestion de la fermeture des modales
    window.onclick = function(event) {
        const factureModal = document.getElementById('factureModal');
        const editModal = document.getElementById('editArticleModal');
        if (event.target === factureModal || event.target === editModal) {
            factureModal.style.display = "none";
            editModal.style.display = "none";
        }
    }
    
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = "none";
        }
    });
});


