const fastify = require('fastify')({ logger: true });
require('dotenv').config();

const mongoose = require('mongoose');
const { Schema } = mongoose;