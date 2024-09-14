const express = require('express');
const router = express.Router();
const db = require('../db');

// Route pour ajouter une question
router.post('/dashboard/addQuestion', (req, res) => {
    const { questionText, option1, option2, option3, option4, correctOption } = req.body;

    const sql = 'INSERT INTO quizz (question_text, option1, option2, option3, option4, correct_option) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [questionText, option1, option2, option3, option4, correctOption], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de la question:', err);
            return res.redirect('/dashboard');
        }
        res.redirect('/dashboard');
    });
});

// Route pour supprimer une question
router.post('/quizz/deleteQuestion/:id', (req, res) => {
    if (!req.user || req.user.username !== 'admin') {
        return res.redirect('/quizz');
    }

    const questionId = req.params.id;

    // Supprimer la question de la base de données
    const sql = 'DELETE FROM quizz WHERE id = ?';
    db.query(sql, [questionId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de la question:', err);
            return res.redirect('/quizz');
        }
        res.redirect('/quizz');
    });
});

// Route pour vérifier la réponse de l'utilisateur
router.post('/quizz/answerQuestion', (req, res) => {
    const { questionId, selectedOption } = req.body;

    const sql = 'SELECT correct_option FROM quizz WHERE id = ?';
    db.query(sql, [questionId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la vérification de la réponse:', err);
            return res.redirect('/quizz');
        }

        const correctOption = result[0].correct_option;
        const isCorrect = parseInt(selectedOption) === correctOption;

        // Mettre à jour le score en session
        if (isCorrect) {
            req.session.quizState.score.correct++;
        } else {
            req.session.quizState.score.incorrect++;
        }

        // Passer à la question suivante
        req.session.quizState.currentQuestionIndex++;

        // Rediriger vers la prochaine question
        res.redirect('/quizz');
    });
});


module.exports = router;
