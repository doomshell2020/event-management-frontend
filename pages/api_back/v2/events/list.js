import { checkApiKey } from '@/middleware/checkApiKey';
import Event from '@/database/models/events/event'; // आपकी Event model
import { Op } from 'sequelize';

export default async function handler(req, res) {
  return checkApiKey(req, res, async () => {
    // console.log('>>>>>>>>>', req.organizer);
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const events = await Event.findAll({
        where: {
          organiser_id: req.organizer.id, // API key से जुड़े organiser के events
          //   status: 'active'
        },
        order: [['ID', 'DESC']]
      });

      return res.status(200).json({
        message: "Data retrieved successfully",
        success: true,
        // total: events.length,
        data: events
      });

    } catch (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
}
