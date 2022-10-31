const express = require('express');

const router = new express.Router();
const treatmentPlaceController = require('../controllers/treatment-place');
const auth = require('../middlewares/authentication');

router.post('/', auth, treatmentPlaceController.createTreatmentPlace);
router.get('/', treatmentPlaceController.getTreatmentPlaceList);
router.patch('/:id', auth, treatmentPlaceController.updateTreatmentPlace);
router.delete('/:id', auth, treatmentPlaceController.deleteTreatmentPlace);

module.exports = router;
