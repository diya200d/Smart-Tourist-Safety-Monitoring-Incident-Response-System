const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get alerts feed (safety alerts + incidents + SOS)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, severity, search } = req.query;

    let safetyAlertsQuery = `
      SELECT
        sa.id,
        sa.title,
        sa.message,
        sa.alert_type,
        sa.severity,
        sa.is_active,
        sa.expires_at,
        sa.created_at,
        l.name AS location_name,
        CONCAT(u.first_name, ' ', u.last_name) AS created_by_name
      FROM safety_alerts sa
      LEFT JOIN locations l ON l.id = sa.location_id
      LEFT JOIN users u ON u.id = sa.created_by
      WHERE sa.is_active = TRUE
    `;
    const safetyParams = [];

    if (type) {
      safetyAlertsQuery += ' AND sa.alert_type = ?';
      safetyParams.push(type);
    }

    if (severity) {
      safetyAlertsQuery += ' AND sa.severity = ?';
      safetyParams.push(severity);
    }

    if (search) {
      safetyAlertsQuery += ' AND (sa.title LIKE ? OR sa.message LIKE ? OR l.name LIKE ?)';
      const wildcardSearch = `%${search}%`;
      safetyParams.push(wildcardSearch, wildcardSearch, wildcardSearch);
    }

    safetyAlertsQuery += ' ORDER BY sa.created_at DESC LIMIT 50';
    const [safetyAlerts] = await pool.execute(safetyAlertsQuery, safetyParams);

    // Always try to return incidents
    let incidentQuery = `
      SELECT i.id, i.title, i.description, i.incident_type, i.severity, i.status, i.created_at,
             l.name as location_name
      FROM incidents i
      LEFT JOIN locations l ON l.id = i.location_id
      WHERE 1=1
    `;
    const incidentParams = [];

    if (search) {
      incidentQuery += ' AND (i.title LIKE ? OR i.description LIKE ? OR i.incident_type LIKE ? OR l.name LIKE ?)';
      const wildcardSearch = `%${search}%`;
      incidentParams.push(wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch);
    }

    // Privacy: normal users should only see their own incident history.
    if (req.user.role === 'user') {
      incidentQuery += ' AND i.reporter_id = ?';
      incidentParams.push(req.user.id);
    }

    incidentQuery += ' ORDER BY i.created_at DESC LIMIT 20';
    const [incidents] = await pool.execute(incidentQuery, incidentParams);

    // Try to return SOS; if sos_alerts is missing, return empty sos list
    let sos = [];
    try {
      let sosQuery = `
        SELECT s.id, s.tourist_id, s.latitude, s.longitude, s.location, s.status, s.timestamp,
               CONCAT(u.first_name, ' ', u.last_name) as tourist_name
        FROM sos_alerts s
        LEFT JOIN users u ON u.id = s.tourist_id
        WHERE 1=1
      `;
      const sosParams = [];

      // Privacy: normal users should only see their own SOS history.
      if (req.user.role === 'user') {
        sosQuery += ' AND s.tourist_id = ?';
        sosParams.push(req.user.id);
      }

      sosQuery += ' ORDER BY s.timestamp DESC LIMIT 20';
      const [sosRows] = await pool.execute(sosQuery, sosParams);
      sos = sosRows;
    } catch (sosErr) {
      console.warn('SOS query failed, returning empty sos list:', sosErr.message);
      sos = [];
    }

    res.json({ alerts: safetyAlerts, incidents, sos });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create safety alert (admin / safety officer)
router.post('/', authenticateToken, requireRole(['admin', 'safety_officer']), async (req, res) => {
  try {
    const { title, message, alertType, severity, locationId, expiresAt } = req.body;

    if (!title || !message || !alertType || !severity) {
      return res.status(400).json({ message: 'title, message, alertType, and severity are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO safety_alerts (title, message, alert_type, severity, location_id, expires_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, message, alertType, severity, locationId || null, expiresAt || null, req.user.id]
    );

    res.status(201).json({
      message: 'Safety alert created successfully',
      alertId: result.insertId
    });
  } catch (err) {
    console.error('Create safety alert error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Emergency contacts for Safety Info page
router.get('/emergency-contacts', authenticateToken, async (req, res) => {
  try {
    const [contacts] = await pool.execute(`
      SELECT id, name, phone, email, department, location_id
      FROM emergency_contacts
      WHERE is_active = TRUE
      ORDER BY name ASC
    `);

    const [tips] = await pool.execute(`
      SELECT id, title, content, category
      FROM safety_tips
      WHERE is_active = TRUE
      ORDER BY id DESC
      LIMIT 20
    `);

    res.json({ contacts, tips });
  } catch (err) {
    console.error('Get emergency contacts error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
