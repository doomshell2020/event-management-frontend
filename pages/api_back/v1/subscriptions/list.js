import { ApiSubscription, EventOrganiser, ApiPlan } from '@/database/models';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const subscriptions = await ApiSubscription.findAll({
            include: [
                {
                    model: EventOrganiser,
                    as: 'organiser',
                    attributes: ['id', 'organisation_name', 'contact_email', 'phone', 'status', 'created_at']
                },
                {
                    model: ApiPlan,
                    as: 'plan',
                    attributes: ['id', 'name', 'price', 'description']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            total: subscriptions.length,
            data: subscriptions,
            message:"Data retrieved successfully"
        });
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
