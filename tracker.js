var express = require('express')
var ejs = require('ejs')
var yaml = require('js-yaml')
var fs   = require('fs')

var app = express()

app.use(express.static(__dirname + '/static'))

.get('/', function (req, res) {
    var nomProjet = "Mon super Projet"

    fs.readdir(__dirname + '/static/bugs', function (err, stats){
        res.render('index.ejs', {nomProjet: nomProjet, nbrBugs: stats.length})
    })
})

.get('/login', function (req, res) {
    res.render('login.ejs')
})

.get('/bug-:idbug', function (req, res) {
    try {
        var bug = yaml.safeLoad(fs.readFileSync(__dirname + '/static/bugs/'+ req.params.idbug +'.yml', 'utf8'));
        //console.log(bug);
    } catch (e) {
        console.log(e);
    }

    res.render('bug.ejs', {bugid: req.params.idbug, bug: bug})
})

.get('/bug/add', function (req, res) {
    res.render('addbug.ejs')
})

app.listen(8080)
