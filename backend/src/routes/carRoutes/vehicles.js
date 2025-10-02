// backend/routes/vehicles.js
const express = require('express');
const router = express.Router();
const { 
  getAllVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} = require('../../controllers/carControllers/vehicleController');
const { authenticate, isAdmin } = require('../../middleware/auth');

// Tüm araçları getir
router.get('/', authenticate, getAllVehicles);

// Tek bir aracı ID ile getir
router.get('/:id', authenticate, getVehicleById);

// Yeni araç ekle (sadece admin)
router.post('/', authenticate, isAdmin, createVehicle);

// Araç güncelle (sadece admin)
router.put('/:id', authenticate, isAdmin, updateVehicle);

// Araç sil (sadece admin)
router.delete('/:id', authenticate, isAdmin, deleteVehicle);

module.exports = router;