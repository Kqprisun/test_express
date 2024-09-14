const express = require('express');
const router = express.Router();
const db = require('../db'); 
const authController = require('../controllers/auth');
const gameAddRouter = require('../controllers/gameadd');
router.use(authController.verifyToken);
const questionsRouter = require('../controllers/questionsuivante'); // Ajout de l'importation
router.use(gameAddRouter);
router.use(authController.verifyToken);
router.use(questionsRouter); // Ajout du routeur questions

router.use((req, res, next) => {
    res.locals.username = req.user ? req.user.username : null;
    next();
});
    // ------Début Routes------

router.get("/", function(req, res){
    res.render("homepage");
});

router.get("/game/:gameTitle/:gameCreator", function(req, res){
    const title = req.params.gameTitle;
    const creator = req.params.gameCreator;
    res.render("game", {
        title: title,
        creator: creator
    });
});
router.get('/gamelist', (req, res) => {
    const sql = 'SELECT * FROM games';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des jeux:', err);
            return res.send('Erreur lors de la récupération des jeux');
        }
        res.render('gamelist', { gamesList: results });
    });
});


router.use('/', gameAddRouter);  // Charge les routes de gameadd.js

router.get("/login", function(req, res){
    res.render("login");
});
router.get("/register", function(req, res){
    res.render("register");
});
router.get('/quizz', (req, res) => {
    const sql = 'SELECT * FROM quizz';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des questions:', err);
            return res.send('Erreur lors de la récupération des questions');
        }

        // Initialiser la session de quiz si ce n'est pas déjà fait
        if (!req.session.quizState) {
            req.session.quizState = {
                currentQuestionIndex: 0,
                score: { correct: 0, incorrect: 0 }
            };
        }

        // Obtenir la question courante à partir de l'index stocké en session
        const currentQuestion = results[req.session.quizState.currentQuestionIndex];

        // Si l'utilisateur a terminé toutes les questions
        if (!currentQuestion) {
            return res.render('quizzEnd', { score: req.session.quizState.score });
        }

        // Passer la question courante et le score à la vue
        res.render('quizz', { 
            question: currentQuestion,
            score: req.session.quizState.score
        });
    });
});


router.get('/dashboard', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('dashboard');
});

router.get('/logout', (req, res) => {
    res.clearCookie('jwt'); // Efface le cookie nommé 'jwt'
    res.redirect('/login'); // Redirige l'utilisateur vers la page de login
});
   
router.get("*", function(req, res){    //route 404 error
    res.send("Error !");
});
    

module.exports = router;