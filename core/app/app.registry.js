import express from 'express'
import mongoose from 'mongoose'
import { registerCollection } from '#collection/collection.registry.js';
import { registerMigration, registerTable } from '#database/database.registry.js';

export const appRouter = express.Router()

export const register = {
  collection(name, config){
    registerCollection(name, config)
  },

  migration(name, file){
    registerMigration(name, file)
  },
  
  table(name, config){
    registerTable(name, config)
  },

//   menu(key, config){
//     ui.registerMenu(key, config)
//   },

//   page(key, config){
//     ui.registerPage(key, config)
//   },

  route(path, fn) {
    const router = express.Router()
    fn(router)
    appRouter.use(`/app/${path}`, router)
  },

  model(name, schema) {
    if (mongoose.models[name]) return mongoose.models[name];
    return mongoose.model(name, new mongoose.Schema(schema));
  },

};