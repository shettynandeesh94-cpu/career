const mongoose = require('mongoose');
const jsonDb = require('../config/jsonDb');
const bcrypt = require('bcryptjs');

const wrapModel = (mongooseModel, collectionName, customMethods = {}) => {
  // Helper to wrap list/doc elements and add helper functions
  const decorateDoc = (doc) => {
    if (!doc) return null;
    
    // Add Mongoose compatibility helpers
    const decorated = {
      ...doc,
      id: doc._id,
      save: async function () {
        if (mongoose.connection.readyState === 1) {
          if (typeof this.save === 'function') {
            return await this.save();
          }
        }
        // Save to local JSON
        return jsonDb.save(collectionName, this);
      }
    };
    
    // Bind custom methods (like matchPassword on User documents)
    for (let name in customMethods) {
      decorated[name] = customMethods[name].bind(decorated);
    }
    
    return decorated;
  };

  const wrapper = {
    find: (query = {}) => {
      if (mongoose.connection.readyState === 1) {
        return mongooseModel.find(query);
      }
      
      const list = jsonDb.find(collectionName, query);
      list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const decoratedList = list.map(decorateDoc);
      
      return {
        sort: function() { return this; },
        select: function() { return this; },
        then: function(onFulfilled) {
          return Promise.resolve(decoratedList).then(onFulfilled);
        }
      };
    },

    findOne: (query = {}) => {
      if (mongoose.connection.readyState === 1) {
        return mongooseModel.findOne(query);
      }
      
      const doc = jsonDb.findOne(collectionName, query);
      const decoratedDoc = decorateDoc(doc);
      
      return {
        select: function() { return this; },
        sort: function() { return this; },
        then: function(onFulfilled) {
          return Promise.resolve(decoratedDoc).then(onFulfilled);
        }
      };
    },

    findById: (id) => {
      if (mongoose.connection.readyState === 1) {
        return mongooseModel.findById(id);
      }
      
      const doc = jsonDb.findById(collectionName, id);
      const decoratedDoc = decorateDoc(doc);
      
      return {
        select: function() { return this; },
        then: function(onFulfilled) {
          return Promise.resolve(decoratedDoc).then(onFulfilled);
        }
      };
    },

    create: async (doc) => {
      if (mongoose.connection.readyState === 1) {
        return await mongooseModel.create(doc);
      }
      
      // Handle password encryption manually for User registration in fallback DB
      if (collectionName === 'users' && doc.password) {
        const salt = await bcrypt.genSalt(10);
        doc.password = await bcrypt.hash(doc.password, salt);
      }
      
      const newDoc = jsonDb.create(collectionName, doc);
      return decorateDoc(newDoc);
    },

    findByIdAndUpdate: async (id, update, options = {}) => {
      if (mongoose.connection.readyState === 1) {
        return await mongooseModel.findByIdAndUpdate(id, update, options);
      }
      
      const updated = jsonDb.findByIdAndUpdate(collectionName, id, update);
      return decorateDoc(updated);
    },

    findByIdAndDelete: async (id) => {
      if (mongoose.connection.readyState === 1) {
        return await mongooseModel.findByIdAndDelete(id);
      }
      
      return jsonDb.findByIdAndDelete(collectionName, id);
    }
  };

  return wrapper;
};

module.exports = wrapModel;
