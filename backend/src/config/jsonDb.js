const fs = require('fs');
const path = require('path');

const DB_FILE = path.resolve(__dirname, '../../data/db.json');

// Ensure database directory and file exist
const initDb = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], resumes: [], jobs: [], interviews: [] }, null, 2));
  }
};

const readData = () => {
  try {
    initDb();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON DB:', error.message);
    return { users: [], resumes: [], jobs: [], interviews: [] };
  }
};

const writeData = (data) => {
  try {
    initDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to JSON DB:', error.message);
  }
};

// Generate simple mock mongo id
const generateId = () => {
  return 'json_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const jsonDb = {
  find: (collection, query = {}) => {
    const data = readData();
    const list = data[collection] || [];
    
    return list.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: (collection, query = {}) => {
    const data = readData();
    const list = data[collection] || [];
    
    return list.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },

  findById: (collection, id) => {
    const data = readData();
    const list = data[collection] || [];
    return list.find(item => item._id === id) || null;
  },

  create: (collection, doc) => {
    const data = readData();
    if (!data[collection]) data[collection] = [];
    
    const newDoc = {
      _id: generateId(),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data[collection].push(newDoc);
    writeData(data);
    return newDoc;
  },

  findByIdAndUpdate: (collection, id, update) => {
    const data = readData();
    const list = data[collection] || [];
    const idx = list.findIndex(item => item._id === id);
    
    if (idx === -1) return null;
    
    const updatedDoc = {
      ...list[idx],
      ...update,
      updatedAt: new Date().toISOString()
    };
    
    list[idx] = updatedDoc;
    data[collection] = list;
    writeData(data);
    return updatedDoc;
  },

  findByIdAndDelete: (collection, id) => {
    const data = readData();
    const list = data[collection] || [];
    const filtered = list.filter(item => item._id !== id);
    const deleted = list.length !== filtered.length;
    
    data[collection] = filtered;
    writeData(data);
    return deleted;
  },

  save: (collection, doc) => {
    const data = readData();
    if (!data[collection]) data[collection] = [];
    
    const list = data[collection];
    if (doc._id) {
      const idx = list.findIndex(item => item._id === doc._id);
      if (idx !== -1) {
        doc.updatedAt = new Date().toISOString();
        list[idx] = doc;
        writeData(data);
        return doc;
      }
    }
    
    // Create new
    const newDoc = {
      _id: doc._id || generateId(),
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newDoc);
    data[collection] = list;
    writeData(data);
    return newDoc;
  }
};

module.exports = jsonDb;
