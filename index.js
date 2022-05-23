const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const gymnases = require('./gymnases.json')
const sportifs = require('./sportifs.json')
const mongoose = require('mongoose');
const { Schema } = mongoose;
const sportifSchema = new Schema({
    IdSportif: Number ,
    Nom: String,
    Prenom: String ,
    Sexe: String ,
    Age: Number ,
    Sports: {
        Jouer: [String],
        Jouer: [String],
        Jouer: [String] 
    },
    IdSportifConseiller: Number,
});

const gymnaseSchema = new Schema({
    IdGymnase: Number,
    NomGymnase: String,
    Adresse: String,
    Ville: String,
    Surface: Number,
    Seances: [{
        IdSportifEntraineur: Number,
        Jour: String,
        Horaire: Number,
        Duree: Number,
        Libelle: String,
    }],
});
try {
    mongoose.connect(process.env.MONGO_URL)
} catch (e) {
    console.error(e);
}

const Sportif = mongoose.model('sportif', sportifSchema);
const Gymnase = mongoose.model('gymnase', gymnaseSchema);
fastify.get('/', async (request, reply) => {
    let sportifsCount = await Sportif.count();
    let gymnasesCount = await Gymnase.count();
    if ( sportifsCount == 0) {
        sportifs.forEach((sportif) => {Sportif.create(sportif)});
    }
    if ( gymnasesCount == 0) {
        gymnases.forEach((gymnase) => {Gymnase.create(gymnase)});
    }

    return {
        "1)":{
            "Collection et nombres": [
                `${Sportif.collection.collectionName}: ${await Sportif.count()}`,
                `${Gymnase.collection.collectionName}: ${await Gymnase.count()}`
            ],
            "Un sportif random": await Sportif.findOne().skip(Math.floor(Math.random() * sportifsCount)),
            "Un gymnase random": await Gymnase.findOne().skip(Math.floor(Math.random() * gymnasesCount))
        },
        "2)": {"Sportif féminins": await Sportif.count({Sexe: /F/i})},
        "3)": {"Sportif entre 20 et 30 ans": await Sportif.find({ Age: { $gt : 20 , $lt : 30 } }, 'Nom Prenom Age', {sort: {Nom: 1}})},
        "4)": {"Sportif qui ont 32 ou 42 ans": await Sportif.find({ $or: [{ Age: 31 }, { Age: 40 }] }, '-_id Nom Prenom Sports.Jouer', {sort: {Nom: 1, Age: -1}})},
        "5)": {"Sportif qui ont au moins 32 ou de sexe féminin": await Sportif.find({ $or: [{Age: { $gt: 31 }}, {Sexe: 'F'}] }, '-_id Nom Prenom Age Sexe Sports.Jouer', {sort: {Age: 1}})},
        "6)": {"Basketer": await Sportif.find({'Sports.Jouer': 'Basket ball'}, '-_id Nom Prenom Sports', {sort: {Nom: 1}})},
        "7)": {"Non sportifs": await Sportif.find({'Sports.Jouer':{$exists:false, $size:0}})},
        "10)": {"Sportifs sans conseillers": await Sportif.find({IdSportifConseiller: null})},
        "11)": {"Sportifs nommé KERVADEC": await Sportif.find({Nom: "KERVADEC"}, '-_id -Age -Sexe')},
        "16": {"Gymnases ne proposant que du basket et du volley": await Gymnase.find(
            {$and:
            [
                {'Seances':{$exists:true}}, 
                {$and: [ { 'Seances.Libelle': "Basket ball" }, { 'Seances.Libelle': "Volley ball" } ]}
            ]
        })},

        
    }
});
const start = async () => {
    try {
      await fastify.listen(3000)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  };
  start();