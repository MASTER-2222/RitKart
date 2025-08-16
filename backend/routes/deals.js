// RitZone Deals Routes
// ==============================================
// Deals management using Supabase with environment variables

const express = require('express');
const { environment } = require('../config/environment');
const { dealsService } = require('../services/supabase-service');

const router = express.Router();

// ==============================================
// 🏷️ GET ALL DEALS
// ==============================================
router.get('/', async (req, res) => {
  try {
    const result = await dealsService.getAllDeals();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deals retrieved successfully',
      data: result.deals,
      count: result.deals.length
    });

  } catch (error) {
    console.error('❌ Get deals error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve deals',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ✨ CREATE NEW DEAL (Admin only)
// ==============================================
router.post('/', async (req, res) => {
  try {
    const dealData = req.body;

    // Basic validation
    const required = ['product_id', 'original_price', 'deal_price', 'end_date'];
    const missing = required.filter(field => !dealData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: required,
        missing: missing
      });
    }

    // Calculate discount percentage if not provided
    if (!dealData.discount_percentage) {
      dealData.discount_percentage = Math.round(
        ((dealData.original_price - dealData.deal_price) / dealData.original_price) * 100
      );
    }

    const result = await dealsService.createDeal(dealData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: result.deal
    });

  } catch (error) {
    console.error('❌ Create deal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create deal',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔄 UPDATE DEAL
// ==============================================
router.put('/:id', async (req, res) => {
  try {
    const dealId = req.params.id;
    const dealData = req.body;

    const result = await dealsService.updateDeal(dealId, dealData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal updated successfully',
      data: result.deal
    });

  } catch (error) {
    console.error('❌ Update deal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update deal',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🗑️ DELETE DEAL
// ==============================================
router.delete('/:id', async (req, res) => {
  try {
    const dealId = req.params.id;

    const result = await dealsService.deleteDeal(dealId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete deal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deal',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;