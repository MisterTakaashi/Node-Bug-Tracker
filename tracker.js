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
    var arrTitres = new Array();

    fs.readdir(__dirname + '/static/bugs', function (err, stats){
        for (var i = 0; i < stats.length; i++) {
            var bug = yaml.safeLoad(fs.readFileSync(__dirname + '/static/bugs/' + stats[i], 'utf8'));
            arrTitres.push(bug.nom)
        }
        res.render('index.ejs', {session: req.session, nomProjet: nomProjet, nbrBugs: stats.length, listeBugs: stats, titres: arrTitres})
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

                    res.redirect('/')
                }
            }
        }
    })
})

.get('/bug/add', function (req, res) {
    if (req.session.pseudo == undefined) { res.redirect('/login') }
    res.render('addbug.ejs', {session: req.session})
})

.post('/bug/add',urlencodedParser, function(req, res) {
    var texteAEcrire = "projet: " + req.body.projet + "\nnom: " + req.body.titreForm + "\ndescription: " + req.body.descriptionForm + "\nauthor: " + req.session.pseudo + "\ndate: " + Math.floor(Date.now() / 1000) + "\n\netapes:\n"
    //console.log(req.body.etapeForm)
    for (var i = 0; i < req.body.etapeForm.length; i++){
        texteAEcrire += "    - etape: " + req.body.etapeForm[i] + "\n"
    }
    texteAEcrire += "\nenvironnement:\n    - os: " + req.body.osForm + "\n      navigateur: " + req.body.navForm

    var nbrBugs = fs.readdirSync(__dirname + '/static/bugs').length + 1

    fs.writeFile(__dirname + '/static/bugs/'+nbrBugs+'.yml', texteAEcrire, function (err) {
        if (err) throw err;
        console.log('Nouveau bug enregistré');
        //console.log(texteAEcrire)
    });
    res.redirect('/')
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
