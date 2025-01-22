const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
    numeroTable: {
        type: Number,
        required: true
    },
    articles: [{
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        },
        quantite: Number,
        prix: Number
    }],
    total: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Facture', factureSchema); 