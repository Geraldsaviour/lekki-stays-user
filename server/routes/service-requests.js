/**
 * Service Requests Route
 * Handles on-demand service requests from guests
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const xss = require('xss');

// Format Nigerian phone to international
const formatPhone = (phone) => {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) return '234' + clean.slice(1);
  if (clean.startsWith('234')) return clean;
  return '234' + clean;
};

// Generate WhatsApp URL
const waURL = (phone, msg) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

// POST /api/services - Submit a service request
router.post('/', async (req, res) => {
  try {
    const {
      guestName,
      phone,
      apartmentName,
      bookingReference,
      serviceType,
      preferredDatetime,
      specialInstructions
    } = req.body;

    // Basic validation
    if (!guestName || !phone || !serviceType || !preferredDatetime) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, service type and preferred date/time are required'
      });
    }

    // Sanitize
    const data = {
      guest_name: xss(guestName.trim()),
      phone: phone.replace(/\D/g, '').slice(-11),
      apartment_name: apartmentName ? xss(apartmentName.trim()) : null,
      booking_reference: bookingReference ? xss(bookingReference.trim().toUpperCase()) : null,
      service_type: xss(serviceType.trim()),
      preferred_datetime: preferredDatetime,
      special_instructions: specialInstructions ? xss(specialInstructions.trim()) : null,
      status: 'pending'
    };

    // Save to Supabase
    const { data: saved, error } = await supabase
      .from('service_requests')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    const formattedDate = new Date(preferredDatetime).toLocaleString('en-NG', {
      weekday: 'short', day: 'numeric', month: 'long',
      year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Admin WhatsApp notification
    const adminMsg = `🛎️ *NEW SERVICE REQUEST*

Service: *${data.service_type}*
Guest: ${data.guest_name}
Phone: ${data.phone}
${data.apartment_name ? `Apartment: ${data.apartment_name}` : ''}
${data.booking_reference ? `Booking Ref: ${data.booking_reference}` : ''}
Preferred Time: ${formattedDate}
${data.special_instructions ? `Notes: ${data.special_instructions}` : ''}

Please confirm this request with the guest.`;

    const adminWhatsapp = waURL(
      process.env.HOST_WHATSAPP_NUMBER?.replace(/\D/g, '') || '2349039269846',
      adminMsg
    );

    // Guest acknowledgement WhatsApp
    const guestMsg = `✅ *SERVICE REQUEST RECEIVED*

Hi ${data.guest_name}! 👋

We've received your *${data.service_type}* request.

📅 Preferred Time: ${formattedDate}
${data.apartment_name ? `🏠 Apartment: ${data.apartment_name}` : ''}
${data.special_instructions ? `📝 Notes: ${data.special_instructions}` : ''}

Our team will confirm your request shortly via WhatsApp.

Questions? Reply to this message or contact us at ${process.env.HOST_WHATSAPP_NUMBER || '+234 903 926 9846'}.

Thank you for choosing LuxStay! 🌟`;

    const guestWhatsapp = waURL(formatPhone(data.phone), guestMsg);

    res.status(201).json({
      success: true,
      serviceRequest: { id: saved.id, serviceType: saved.service_type, status: saved.status },
      adminWhatsappLink: adminWhatsapp,
      guestWhatsappLink: guestWhatsapp,
      message: 'Service request submitted successfully'
    });

  } catch (error) {
    console.error('Service request error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit service request' });
  }
});

// GET /api/services - Admin: get all service requests
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, serviceRequests: data, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch service requests' });
  }
});

// PATCH /api/services/:id - Admin: update status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('service_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, serviceRequest: data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update service request' });
  }
});

module.exports = router;
