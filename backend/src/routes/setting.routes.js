const express = require('express');
const settingController = require('../controllers/setting.controller');
const settingValidator = require('../validators/setting.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.use(authenticate);

// Read operations allowed for multiple roles
router.get(
  '/',
  authorize('Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'),
  settingValidator.validatePagination,
  settingController.getAllSettings
);

router.get(
  '/:key',
  authorize('Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'),
  settingController.getSettingByKey
);

// Write operations strictly restricted to Admin
router.post(
  '/',
  authorize('Admin'),
  settingValidator.validateSettingPayload,
  settingController.createSetting
);

router.put(
  '/:key',
  authorize('Admin'),
  settingValidator.validateSettingPayload,
  settingController.updateSetting
);

router.delete(
  '/:key',
  authorize('Admin'),
  settingController.deleteSetting
);

module.exports = router;
