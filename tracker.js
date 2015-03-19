var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var yaml = require('js-yaml')
var fs   = require('fs')
var session = require('cookie-session')
var sha256 = require('js-sha256')

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express()

app.use(session({ secret: 's3cr3tind3chiffrabl3' }))

.use(express.static(__dirname + '/static'))

.get('/', function (req, res) {
    var nomProjet = "Mon super Projet"

    fs.readdir(__dirname + '/static/bugs', function (err, stats){
        res.render('index.ejs', {session: req.session, nomProjet: nomProjet, nbrBugs: stats.length})
    })
})

.get('/login', function (req, res) {
    res.render('login.ejs', {session: req.session})
})

.post('/login',urlencodedParser, function(req, res) {
    fs.readdir(__dirname + '/static/users', function (err, stats){
        for (var i = 0; i < stats.length; i++){
            var pseudoFichier = stats[i].split('.')[0]
            var pseudo = req.body.pseudo
            if(pseudo == pseudoFichier){
                var user = yaml.safeLoad(fs.readFileSync(__dirname + '/static/users/' + stats[i], 'utf8'));

                if(user.password == sha256(req.body.password)){
                    console.log("Connexion de " + user.pseudo)

                    //console.log("DEBUG: user=" + user.projets)

                    req.session.pseudo = user.pseudo
                    req.session.email = user.email
                    req.session.dateinscri = user.dateinscri
                    req.session.projets = user.projets

                    res.redirect('/');
                }
            }
        }
    })
})

.get('/bug/add', function (req, res) {
    res.render('addbug.ejs', {session: req.session})
})

.get('/bug/:idbug', function (req, res) {
    try {
        var bug = yaml.safeLoad(fs.readFileSync(__dirname + '/static/bugs/'+ req.params.idbug +'.yml', 'utf8'));
    } catch (e) {
        console.log(e);
    }
    res.render('bug.ejs', {session: req.session, bugid: req.params.idbug, bug: bug})
})

app.listen(8080)
