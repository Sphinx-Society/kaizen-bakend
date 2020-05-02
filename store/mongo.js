const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');

const dbHost = config.mongo.host;
const dbUser = encodeURIComponent(config.mongo.user);
const dbPassword = encodeURIComponent(config.mongo.password);
const dbName = config.mongo.database;

const MONGO_URI = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/${dbName}?retryWrites=true&w=majority`;
/**
 * Class that handles the MongoDB connection and exposes the CRUD operations.
 * @class MongoLib
 */
class MongoLib {

  constructor() {
    this.client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    this.dbName = dbName;
  }

  /**
   * Creates an instance of MongoLib.
   * @returns {}
   * @memberof MongoLib
   */
  connect() {
    if (!MongoLib.connection) {
      MongoLib.connection = new Promise((resolve, reject) => {
        this.client.connect((err) => {
          if (err) {
            reject(err);
          }
          resolve(this.client.db(this.dbName));
        });
      });
    }
    return MongoLib.connection;
  }

  /**
   * Method that list the collection and filtered with a query
   * @param {*} collection
   * @param {*} query
   * @returns
   * @memberof MongoLib
   */
  list(collection, query) {
    return this.connect().then((db) => {
      return db.collection(collection).find(query).toArray();
    });
  }

  /**
   * Method that retrieve an item of the collection by uid
   * @param {*} collection
   * @param {*} id
   * @returns
   * @memberof MongoLib
   */
  get(collection, id) {
    return this.connect().then((db) => {
      return db.collection(collection).findOne({ _id: ObjectId(id) });
    });
  }

  /**
   * Method that insert an item in the collection
   * @param {*} collection
   * @param {*} data
   * @returns
   * @memberof MongoLib
   */
  insert(collection, data) {
    return this.connect().then((db) => {
      return db.collection(collection).insertOne(data);
    })
      .then((result) => (
        {
          insertedId: result.insertedCount > 0 ? result.insertedId : 0,
          insertedCount: result.insertedCount,
        }));
  }

  /**
   * Method that update an item ot the collection
   * @param {*} collection
   * @param {*} id
   * @param {*} data
   * @returns
   * @memberof MongoLib
   */
  update(collection, id, data) {
    return this.connect().then((db) => {
      return db.collection(collection).updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: false });
    })
      .then((result) => (
        {
          updatedId: result.modifiedCount > 0 ? id : 0,
          updatedCount: result.modifiedCount,
        }));
  }

  /**
   * Method that delete an item of the collection
   * @param {*} collection
   * @param {*} id
   * @returns
   * @memberof MongoLib
   */
  delete(collection, id) {
    return this.connect().then((db) => {
      return db.collection(collection).deleteOne({ _id: ObjectId(id) });
    })
      .then((result) => ({ deletedCount: result.deletedCount }));
  }
}

module.exports = MongoLib;
