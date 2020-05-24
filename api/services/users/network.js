const express = require('express');
const pdf = require('html-pdf');
const generatorDocument = require('../../../lib/PDF/generator');
const response = require('../../../network/response');
const Controller = require('./index');
const jwtAuthMiddleware = require('../../../middleware/jwtMiddleware');
const {
  userIdSchema,
  createUserSchema,
  listUsersSchema,
  updateUserSchema,
  updateUserProfileSchema,
  createUserTestSchema,
  testIdSchema,
} = require('./schema');
const uploadMiddleware = require('../../../middleware/uploaderMiddleware');

const router = express.Router();

/**
 * Users router that compare the request with the schema and if it's correct, it send it to the controller
 * @param  {} validation
 */
const Router = (validation) => {

  /**
   * User Routes
   */
  router.post('/', validation(createUserSchema), insertUser);
  router.post('/login', loginUser);
  router.get('/', validation(listUsersSchema, 'query'), listUsers);
  router.get('/:userId', validation({ userId: userIdSchema }, 'params'), getUser);
  router.put('/:userId', validation({ userId: userIdSchema }, 'params'), validation(updateUserSchema), updateUser);
  router.delete('/:userId', validation({ userId: userIdSchema }, 'params'), deleteUser);

  // TODO refactor next
  router.post('/upload', jwtAuthMiddleware, uploadImages);

  /**
   * Profile Roustes
   */
  router.get('/:userId/profile', validation({ userId: userIdSchema }, 'params'), getUserProfile);
  router.put('/:userId/profile', validation({ userId: userIdSchema }, 'params'), validation(updateUserProfileSchema), updateUserProfile);

  /**
   * Medical test Routes
   */
  router.post('/:userId/tests', validation({ userId: userIdSchema }, 'params'), validation(createUserTestSchema), insertUserTest);
  router.get('/:userId/tests', validation({ userId: userIdSchema }, 'params'), getUserTests);
  router.get('/:userId/tests/:testId', validation({ userId: userIdSchema, testId: testIdSchema }, 'params'), getUserTest);
  router.put('/:userId/tests/:testId', validation({ userId: userIdSchema, testId: testIdSchema }, 'params'), updateMedicalTest);
  router.delete('/:userId/tests/:testId', validation({ userId: userIdSchema, testId: testIdSchema }, 'params'), deleteUserTest);

  /**
   * Results medical tests Routes
   */
  router.get('/:userId/tests/:testId/results', validation({ userId: userIdSchema, testId: testIdSchema }, 'params'), getMedicalResults);
  router.get('/:userId/tests/:testId/results/document', validation({ userId: userIdSchema, testId: testIdSchema }, 'params'), getResultsPdf);
  router.put('/:userId/tests/:testId/results', validation({ userId: userIdSchema, testId: testIdSchema }, 'params'), upsertMedicalResults);

  function insertUser(req, res, next) {

    Controller.insertUser(req.body)
      .then((user) => {
        response.success(req, res, user, 201);
      })
      .catch(next);
  }

  function listUsers(req, res, next) {

    Controller.listUsers(req.query)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function getUser(req, res, next) {

    const { userId } = req.params;

    Controller.getUser(userId)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function updateUser(req, res, next) {

    const { userId } = req.params;
    const userData = req.body;

    Controller.updateUser(userId, userData)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function deleteUser(req, res, next) {

    const { userId } = req.params;

    Controller.deleteUser(userId)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function loginUser(req, res, next) {
    Controller.loginUser(req.body)
      .then((data) => {
        response.success(req, res, data, 200);
      })
      .catch(next);
  }

  function getUserProfile(req, res, next) {

    const { userId } = req.params;

    Controller.getUserProperty(userId, 'profile')
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function updateUserProfile(req, res, next) {

    const { userId } = req.params;
    const userData = req.body;

    Controller.updateUser(userId, userData)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function insertUserTest(req, res, next) {

    const { userId } = req.params;
    const userData = req.body;

    Controller.addTestToUser(userId, userData)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function getUserTest(req, res, next) {

    const { userId } = req.params;

    Controller.getUserProperty(userId, 'tests', req.params)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function getUserTests(req, res, next) {

    const { userId } = req.params;

    Controller.getTests(userId, 'tests', req.query)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function deleteUserTest(req, res, next) {

    const { testId } = req.params;

    Controller.deleteUserTest(testId)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function updateMedicalTest(req, res, next) {
    const { testId } = req.params;
    const testData = req.body;

    Controller.updateMedicalTest(testId, testData)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function uploadImages(req, res, next) {
    Controller.uploadImage(req.file, req.body.username)
      .then((data) => {
        response.success(req, res, data, 200);
      })
      .catch(next);
  }

  function getMedicalResults(req, res, next) {
    const { userId, testId } = req.params;

    Controller.getTestResults(userId, testId)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function upsertMedicalResults(req, res, next) {
    const { testId } = req.params;
    const testResultsData = req.body;

    Controller.upsertMedicalResultsData(testId, testResultsData)
      .then((user) => {
        response.success(req, res, user, 200);
      })
      .catch(next);
  }

  function getResultsPdf(req, res, next) {
    const { userId } = req.params;

    Controller.getUserProperty(userId, 'tests', req.params)
      .then(async (user) => {
        res.set('Content-Type', 'application/pdf');
        const file = await generatorDocument(user.tests[0]);
        pdf.create(file).toStream((err, stream) => {
          if (err) console.log(err);
          res.set('Content-type', 'application/pdf');
          stream.pipe(res);
        });
      })
      .catch(next);
  }

  return router;
};

module.exports = Router;

