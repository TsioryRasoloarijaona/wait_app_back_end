import express from "express";
import {getAvailableSlots , createRdv , getRdvByEstablishment} from '../controller/rdvController.js'
const router = express.Router();

router.get('/slots/:id' , getAvailableSlots)
router.post('/create' , createRdv)
router.get('/:id' , getRdvByEstablishment)
export default router;
