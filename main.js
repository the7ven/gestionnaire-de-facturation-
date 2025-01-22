// Stockage local des articles et factures
let articles = JSON.parse(localStorage.getItem('articles')) || [];
let factures = JSON.parse(localStorage.getItem('factures')) || [];
let currentCart = [];

// Gestion des onglets
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
    
    if (tabId === 'nouvelle-facture') {
        afficherArticlesDisponibles();
    } else if (tabId === 'historique') {
        afficherHistorique();
    } else if (tabId === 'articles') {
        afficherListeArticles();
    }
}

// Fonction pour charger les articles depuis l'API
async function chargerArticles() {
    try {
        const response = await fetch('/api/articles');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors du chargement des articles:', error);
        return [];
    }
}

// Modifier la fonction d'affichage des articles
async function afficherArticlesDisponibles() {
    const tbody = document.querySelector('#articles-table tbody');
    tbody.innerHTML = '';
    
    const articles = await chargerArticles();

    articles.forEach(article => {
        const tr = document.createElement('tr');
        
        // Cellule nom
        const tdNom = document.createElement('td');
        tdNom.textContent = article.nom;
        
        // Cellule prix
        const tdPrix = document.createElement('td');
        tdPrix.textContent = `${parseFloat(article.prix).toFixed(2)} €`;
        
        // Cellule actions
        const tdActions = document.createElement('td');
        const divControls = document.createElement('div');
        divControls.className = 'quantity-controls';
        
        // Bouton moins
        const btnMinus = document.createElement('button');
        btnMinus.className = 'btn-quantity';
        btnMinus.onclick = () => modifierQuantiteInput(article.id, -1);
        const iconMinus = document.createElement('i');
        iconMinus.className = 'fas fa-minus';
        btnMinus.appendChild(iconMinus);
        
        // Input quantité
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.value = '1';
        input.className = 'quantity-input';
        input.id = `quantity-${article.id}`;
        input.onchange = () => validateQuantity(input);
        
        // Bouton plus
        const btnPlus = document.createElement('button');
        btnPlus.className = 'btn-quantity';
        btnPlus.onclick = () => modifierQuantiteInput(article.id, 1);
        const iconPlus = document.createElement('i');
        iconPlus.className = 'fas fa-plus';
        btnPlus.appendChild(iconPlus);
        
        // Bouton ajouter
        const btnAdd = document.createElement('button');
        btnAdd.className = 'btn-add';
        btnAdd.onclick = () => ajouterAuPanier(article.id);
        const iconCart = document.createElement('i');
        iconCart.className = 'fas fa-cart-plus';
        const spanAdd = document.createElement('span');
        spanAdd.textContent = 'Ajouter';
        btnAdd.append(iconCart, ' ', spanAdd);
        
        // Assemblage des contrôles
        divControls.append(btnMinus, input, btnPlus, btnAdd);
        tdActions.appendChild(divControls);
        
        // Assemblage final
        tr.append(tdNom, tdPrix, tdActions);
        tbody.appendChild(tr);
    });
}

function validateQuantity(input) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 1) {
        input.value = 1;
    }
}

function modifierQuantiteInput(articleId, delta) {
    const input = document.getElementById(`quantity-${articleId}`);
    const currentValue = parseInt(input.value) || 1;
    const newValue = currentValue + delta;
    if (newValue >= 1) {
        input.value = newValue;
    }
}

// Modifier la fonction d'ajout au panier
async function ajouterAuPanier(articleId) {
    const articles = await chargerArticles();
    const article = articles.find(a => a.id === articleId);
    const quantityInput = document.getElementById(`quantity-${articleId}`);
    const quantity = parseInt(quantityInput.value) || 1;

    if (article) {
        // Debug: Afficher l'article trouvé
        console.log('Article trouvé:', article);

        // Vérifier si l'article existe déjà dans le panier
        const existingItem = currentCart.find(item => item.id === article.id);
        
        if (existingItem) {
            // Si l'article existe, augmenter la quantité
            existingItem.quantite += quantity;
            existingItem.total = existingItem.quantite * parseFloat(article.prix);
            console.log('Article existant mis à jour:', existingItem);
        } else {
            // Sinon, ajouter le nouvel article avec sa quantité
            const newItem = {
                id: article.id,
                nom: article.nom,
                prix: parseFloat(article.prix),
                quantite: quantity,
                total: quantity * parseFloat(article.prix)
            };
            console.log('Nouvel article ajouté:', newItem);
            currentCart.push(newItem);
        }
        
        // Réinitialiser l'input de quantité
        quantityInput.value = 1;
        afficherPanier();
    }
}

// Modifier l'affichage du panier
function afficherPanier() {
    const cartDiv = document.getElementById('current-cart');
    cartDiv.style.opacity = '0';
    
    setTimeout(() => {
        cartDiv.innerHTML = '';
        let total = 0;

        if (currentCart.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'cart-empty';
            const emptyText = document.createElement('p');
            emptyText.textContent = 'Aucun article dans le panier';
            emptyDiv.appendChild(emptyText);
            cartDiv.appendChild(emptyDiv);
        } else {
            currentCart.forEach((article, index) => {
                const sousTotal = article.prix * article.quantite;
                
                // Création de l'élément principal
                const divItem = document.createElement('div');
                divItem.className = 'cart-item';

                // Détails de l'article
                const divDetails = document.createElement('div');
                divDetails.className = 'cart-item-details';

                const divName = document.createElement('div');
                divName.className = 'cart-item-name';
                divName.textContent = article.nom;

                const divPrice = document.createElement('div');
                divPrice.className = 'cart-item-price';

                const spanUnit = document.createElement('span');
                spanUnit.className = 'price-unit';
                spanUnit.textContent = `${article.prix.toFixed(2)} €/unité`;

                const spanTotal = document.createElement('span');
                spanTotal.className = 'price-total';
                spanTotal.textContent = `Total: ${sousTotal.toFixed(2)} €`;

                divPrice.append(spanUnit, spanTotal);
                divDetails.append(divName, divPrice);

                // Contrôles de quantité
                const divQuantity = document.createElement('div');
                divQuantity.className = 'cart-item-quantity';

                const btnMinus = document.createElement('button');
                btnMinus.className = 'btn-quantity';
                btnMinus.onclick = () => modifierQuantite(index, -1);
                const iconMinus = document.createElement('i');
                iconMinus.className = 'fas fa-minus';
                btnMinus.appendChild(iconMinus);

                const spanQuantity = document.createElement('span');
                spanQuantity.className = 'quantity-display';
                spanQuantity.textContent = article.quantite;

                const btnPlus = document.createElement('button');
                btnPlus.className = 'btn-quantity';
                btnPlus.onclick = () => modifierQuantite(index, 1);
                const iconPlus = document.createElement('i');
                iconPlus.className = 'fas fa-plus';
                btnPlus.appendChild(iconPlus);

                divQuantity.append(btnMinus, spanQuantity, btnPlus);

                // Bouton supprimer
                const btnRemove = document.createElement('button');
                btnRemove.className = 'btn-remove';
                btnRemove.onclick = () => retirerDuPanier(index);
                const spanRemove = document.createElement('span');
                spanRemove.className = 'remove-icon';
                spanRemove.textContent = '×';
                btnRemove.appendChild(spanRemove);

                // Assemblage final
                divItem.append(divDetails, divQuantity, btnRemove);
                cartDiv.appendChild(divItem);
                
                total += sousTotal;
            });
        }

        document.getElementById('cart-total').textContent = total.toFixed(2);
        cartDiv.style.opacity = '1';
    }, 50);
}

// Ajouter une fonction pour modifier la quantité
function modifierQuantite(index, delta) {
    const article = currentCart[index];
    const nouvelleQuantite = article.quantite + delta;
    
    if (nouvelleQuantite > 0) {
        article.quantite = nouvelleQuantite;
        article.total = article.quantite * article.prix;
        afficherPanier();
    } else if (nouvelleQuantite === 0) {
        retirerDuPanier(index);
    }
}

function retirerDuPanier(index) {
    const cartItems = document.querySelectorAll('.cart-item');
    const itemToRemove = cartItems[index];
    
    // Ajouter la classe d'animation
    itemToRemove.classList.add('removing');
    
    // Attendre la fin de l'animation avant de supprimer
    setTimeout(() => {
        currentCart.splice(index, 1);
        afficherPanier();
    }, 300); // Correspond à la durée de l'animation
}

// Modifier la fonction de finalisation de facture
async function finaliserFacture() {
    const tableNumber = document.getElementById('table-number').value;
    
    // Vérification des champs requis
    if (!tableNumber || currentCart.length === 0) {
        showErrorToast('Veuillez remplir le numéro de table et ajouter des articles');
        return;
    }

    try {
        // Debug: Afficher le panier actuel
        console.log('Contenu du panier:', currentCart);

        // Calculer le total
        const total = currentCart.reduce((sum, article) => sum + (article.prix * article.quantite), 0);

        // Formater les articles correctement
        const articlesFormatted = currentCart.map(article => {
            console.log('Article avant formatage:', article);
            
            const articleFormatted = {
                article_id: parseInt(article.id),
                quantite: parseInt(article.quantite),
                prix_unitaire: parseFloat(article.prix)
            };
            
            console.log('Article après formatage:', articleFormatted);
            return articleFormatted;
        });

        const factureData = {
            numeroTable: parseInt(tableNumber),
            articles: articlesFormatted,
            total: parseFloat(total.toFixed(2))
        };

        console.log('Données complètes de la facture:', factureData);

        const response = await fetch('/api/factures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(factureData)
        });

        const responseData = await response.json();
        console.log('Réponse du serveur:', responseData);

        if (!response.ok) {
            throw new Error(responseData.message || 'Erreur lors de la création de la facture');
        }

        // Réinitialiser le panier
        currentCart = [];
        document.getElementById('table-number').value = '';
        afficherPanier();
        
        // Notification de succès
        showSuccessToast('Facture finalisée avec succès!');
        
        // Rafraîchir l'historique
        afficherHistorique();
    } catch (error) {
        console.error('Erreur:', error);
        showErrorToast(error.message || 'Erreur lors de la finalisation de la facture');
    }
}

// Affichage de l'historique
async function afficherHistorique() {
    try {
        const response = await fetch('/api/factures');
        const factures = await response.json();
        
    const tbody = document.querySelector('#historique-table tbody');
    tbody.innerHTML = '';

    factures.forEach(facture => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${facture.id}</td>
                <td>${facture.numero_table}</td>
                <td>${moment(facture.date_creation).format('DD/MM/YYYY HH:mm')}</td>
                <td>${parseFloat(facture.total).toFixed(2)} €</td>
                <td>
                    <button onclick="voirDetailsFacture(${facture.id})" class="btn">Détails</button>
                </td>
        `;
        tbody.appendChild(tr);
    });
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        showErrorToast('Erreur lors du chargement de l\'historique');
    }
}

async function voirDetailsFacture(factureId) {
    try {
        const response = await fetch(`/api/factures/${factureId}`);
        const facture = await response.json();

        const articles = facture.articles || facture.articles_details || [];
        
        let content = `
            <div class="facture-details">
                <div class="facture-header">
                    <h2>Facture #${facture.id}</h2>
                    <p>Restaurant Babana</p>
                </div>
                <div class="facture-info">
                    <p><strong>Table N°:</strong> ${facture.numero_table}</p>
                    <p><strong>Date:</strong> ${moment(facture.date_creation).format('DD/MM/YYYY à HH:mm')}</p>
                </div>
                <table class="facture-articles">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Article</th>
                            <th style="text-align: center;">Quantité</th>
                            <th style="text-align: right;">Prix unitaire</th>
                            <th style="text-align: right;">Sous-total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (articles && articles.length > 0) {
            articles.forEach(article => {
                const prix = parseFloat(article.prix_unitaire || article.prix);
                const quantite = parseInt(article.quantite);
                const sousTotal = prix * quantite;
                
                content += `
                    <tr>
                        <td style="text-align: left;">${article.nom}</td>
                        <td style="text-align: center;">${quantite}</td>
                        <td style="text-align: right;">${prix.toFixed(2)} €</td>
                        <td style="text-align: right;">${sousTotal.toFixed(2)} €</td>
                    </tr>
                `;
            });
        } else {
            content += `
                <tr>
                    <td colspan="4" style="text-align: center;">Aucun article trouvé</td>
                </tr>
            `;
        }

        content += `
                    </tbody>
                </table>
                <div class="facture-total">
                    Total à payer: ${parseFloat(facture.total).toFixed(2)} €
                </div>
            </div>
        `;

        showModal(content);
    } catch (error) {
        console.error('Erreur:', error);
        Toastify({
            text: "Erreur lors de la récupération des détails de la facture",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#ff6b6b"
            }
        }).showToast();
    }
}

// Améliorer la fonction showModal
function showModal(content) {
    const modal = document.getElementById('factureModal');
    const modalContent = document.getElementById('modalContent');
    
    // Nettoyer le contenu précédent
    modalContent.innerHTML = '';
    
    // Ajouter le nouveau contenu
    modalContent.innerHTML = content;
    
    // Afficher le modal avec une animation
    modal.style.display = 'block';
    
    // Gérer la fermeture
    const span = document.getElementsByClassName('close')[0];
    span.onclick = () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
        }, 300);
    };
    
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.opacity = '1';
            }, 300);
        }
    };
}

// Charger les articles au démarrage
document.addEventListener('DOMContentLoaded', () => {
    afficherArticlesDisponibles();
});

// Au début du fichier main.js, après la déclaration des variables
async function ajouterArticle() {
    const nom = document.getElementById('article-name').value;
    const prix = parseFloat(document.getElementById('article-price').value);
    const categorie = document.getElementById('article-category').value;

    if (!nom || !prix || !categorie) {
        Toastify({
            text: "Veuillez remplir tous les champs",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#ff6b6b"
            }
        }).showToast();
        return;
    }

    try {
        const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nom, prix, categorie })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout de l\'article');
        }

        const nouvelArticle = await response.json();
        console.log('Article ajouté:', nouvelArticle);

        // Réinitialiser le formulaire
        document.getElementById('article-name').value = '';
        document.getElementById('article-price').value = '';
        
        // Rafraîchir la liste des articles si on est sur l'onglet nouvelle facture
        if (document.querySelector('#nouvelle-facture').classList.contains('active')) {
            afficherArticlesDisponibles();
        }

        Toastify({
            text: "Article ajouté avec succès!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#51cf66"
            }
        }).showToast();
    } catch (error) {
        console.error('Erreur:', error);
        Toastify({
            text: "Erreur lors de l'ajout de l'article",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#ff6b6b"
            }
        }).showToast();
    }
}

// Modifier la fonction finaliserFacture pour utiliser Toastify
function showSuccessToast(message) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "#51cf66"
        }
    }).showToast();
}

// Pour les erreurs
function showErrorToast(message) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "#ff6b6b"
        }
    }).showToast();
}

// Fonction pour afficher la liste des articles dans l'onglet gestion
async function afficherListeArticles() {
    const tbody = document.querySelector('#articles-list tbody');
    tbody.innerHTML = '';
    
    try {
        const articles = await chargerArticles();
        
        articles.forEach(article => {
            const tr = document.createElement('tr');
            
            // Nom
            const tdNom = document.createElement('td');
            tdNom.textContent = article.nom;
            
            // Prix
            const tdPrix = document.createElement('td');
            tdPrix.textContent = `${parseFloat(article.prix).toFixed(2)} €`;
            
            // Catégorie
            const tdCategorie = document.createElement('td');
            tdCategorie.textContent = article.categorie.charAt(0).toUpperCase() + article.categorie.slice(1);
            
            // Actions
            const tdActions = document.createElement('td');
            const divActions = document.createElement('div');
            divActions.className = 'article-actions';
            
            // Bouton modifier
            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn btn-edit';
            btnEdit.onclick = () => ouvrirModalEdition(article);
            const iconEdit = document.createElement('i');
            iconEdit.className = 'fas fa-edit';
            btnEdit.appendChild(iconEdit);
            
            // Bouton supprimer
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn btn-delete';
            btnDelete.onclick = () => confirmerSuppression(article);
            const iconDelete = document.createElement('i');
            iconDelete.className = 'fas fa-trash';
            btnDelete.appendChild(iconDelete);
            
            divActions.append(btnEdit, btnDelete);
            tdActions.appendChild(divActions);
            
            tr.append(tdNom, tdPrix, tdCategorie, tdActions);
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des articles:', error);
        showErrorToast('Erreur lors du chargement des articles');
    }
}

// Fonction pour ouvrir le modal d'édition
function ouvrirModalEdition(article) {
    document.getElementById('edit-article-id').value = article.id;
    document.getElementById('edit-article-name').value = article.nom;
    document.getElementById('edit-article-price').value = article.prix;
    document.getElementById('edit-article-category').value = article.categorie;
    
    const modal = document.getElementById('editArticleModal');
    modal.style.display = 'block';
}

// Fonction pour fermer le modal d'édition
function closeEditModal() {
    const modal = document.getElementById('editArticleModal');
    modal.style.display = 'none';
}

// Fonction pour sauvegarder les modifications d'un article
async function sauvegarderArticle() {
    const id = document.getElementById('edit-article-id').value;
    const nom = document.getElementById('edit-article-name').value;
    const prix = parseFloat(document.getElementById('edit-article-price').value);
    const categorie = document.getElementById('edit-article-category').value;

    if (!nom || !prix || !categorie) {
        showErrorToast('Veuillez remplir tous les champs');
        return;
    }

    try {
        const response = await fetch(`/api/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nom, prix, categorie })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la modification de l\'article');
        }

        showSuccessToast('Article modifié avec succès');
        closeEditModal();
        afficherListeArticles();
        afficherArticlesDisponibles();
    } catch (error) {
        console.error('Erreur:', error);
        showErrorToast('Erreur lors de la modification de l\'article');
    }
}

// Fonction pour confirmer et supprimer un article
function confirmerSuppression(article) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.nom}" ?`)) {
        supprimerArticle(article.id);
    }
}

// Fonction pour supprimer un article
async function supprimerArticle(id) {
    try {
        const response = await fetch(`/api/articles/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'article');
        }

        showSuccessToast('Article supprimé avec succès');
        afficherListeArticles();
        afficherArticlesDisponibles();
    } catch (error) {
        console.error('Erreur:', error);
        showErrorToast('Erreur lors de la suppression de l\'article');
    }
}

// Fermer le modal quand on clique en dehors
window.onclick = function(event) {
    const editModal = document.getElementById('editArticleModal');
    if (event.target === editModal) {
        closeEditModal();
    }
}

// Charger les articles
function loadArticles() {
    const articles = ArticleStorage.getAll();
    displayArticles(articles);
}

// Afficher les articles
function displayArticles(articles) {
    const articlesContainer = document.getElementById('articles-container');
    articlesContainer.innerHTML = '';

    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'article-card';
        articleElement.innerHTML = `
            <h3>${article.nom}</h3>
            <p>Prix: ${article.prix}€</p>
            <p>Catégorie: ${article.categorie}</p>
            <button onclick="addToFacture(${article.id})">Ajouter à la facture</button>
        `;
        articlesContainer.appendChild(articleElement);
    });
}

// Ajouter un article
function addArticle(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const article = {
        nom: formData.get('nom'),
        prix: parseFloat(formData.get('prix')),
        categorie: formData.get('categorie')
    };

    ArticleStorage.add(article);
    loadArticles();
    event.target.reset();
}

// Facture courante
let currentFacture = {
    numero_table: null,
    articles: [],
    total: 0
};

// Ajouter à la facture
function addToFacture(articleId) {
    if (!currentFacture.numero_table) {
        const tableNumber = prompt('Numéro de table :');
        if (!tableNumber) return;
        currentFacture.numero_table = parseInt(tableNumber);
    }

    const article = ArticleStorage.getById(articleId);
    if (article) {
        const existingItem = currentFacture.articles.find(item => item.article_id === articleId);
        if (existingItem) {
            existingItem.quantite++;
        } else {
            currentFacture.articles.push({
                article_id: articleId,
                nom: article.nom,
                prix_unitaire: article.prix,
                quantite: 1
            });
        }
        currentFacture.total = calculateTotal();
        displayCurrentFacture();
    }
}

// Calculer le total
function calculateTotal() {
    return currentFacture.articles.reduce((total, item) => {
        return total + (item.prix_unitaire * item.quantite);
    }, 0);
}

// Afficher la facture courante
function displayCurrentFacture() {
    const factureContainer = document.getElementById('facture-courante');
    factureContainer.innerHTML = `
        <h3>Facture - Table ${currentFacture.numero_table}</h3>
        <ul>
            ${currentFacture.articles.map(item => `
                <li>
                    ${item.nom} x ${item.quantite} = ${(item.prix_unitaire * item.quantite).toFixed(2)}€
                    <button onclick="removeFromFacture(${item.article_id})">-</button>
                </li>
            `).join('')}
        </ul>
        <p>Total: ${currentFacture.total.toFixed(2)}€</p>
        <button onclick="saveFacture()">Enregistrer la facture</button>
    `;
}

// Retirer de la facture
function removeFromFacture(articleId) {
    const item = currentFacture.articles.find(item => item.article_id === articleId);
    if (item) {
        if (item.quantite > 1) {
            item.quantite--;
        } else {
            currentFacture.articles = currentFacture.articles.filter(item => item.article_id !== articleId);
        }
        currentFacture.total = calculateTotal();
        displayCurrentFacture();
    }
}

// Sauvegarder la facture
function saveFacture() {
    if (currentFacture.articles.length === 0) {
        alert('La facture est vide !');
        return;
    }

    FactureStorage.add({
        numero_table: currentFacture.numero_table,
        articles: currentFacture.articles,
        total: currentFacture.total
    });

    // Réinitialiser la facture courante
    currentFacture = {
        numero_table: null,
        articles: [],
        total: 0
    };
    
    document.getElementById('facture-courante').innerHTML = '';
    loadFactures();
}

// Charger les factures
function loadFactures() {
    const factures = FactureStorage.getAll();
    displayFactures(factures);
}

// Afficher les factures
function displayFactures(factures) {
    const facturesContainer = document.getElementById('factures-container');
    facturesContainer.innerHTML = '';

    factures.forEach(facture => {
        const factureElement = document.createElement('div');
        factureElement.className = 'facture-card';
        factureElement.innerHTML = `
            <h3>Facture #${facture.id} - Table ${facture.numero_table}</h3>
            <p>Date: ${new Date(facture.date_creation).toLocaleString()}</p>
            <ul>
                ${facture.articles.map(item => `
                    <li>${item.nom} x ${item.quantite} = ${(item.prix_unitaire * item.quantite).toFixed(2)}€</li>
                `).join('')}
            </ul>
            <p>Total: ${facture.total.toFixed(2)}€</p>
            <button onclick="deleteFacture(${facture.id})">Supprimer</button>
        `;
        facturesContainer.appendChild(factureElement);
    });
}

// Supprimer une facture
function deleteFacture(id) {
    if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
        FactureStorage.delete(id);
        loadFactures();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    loadFactures();
    
    // Gestionnaire pour le formulaire d'ajout d'article
    document.getElementById('article-form').addEventListener('submit', addArticle);
});




