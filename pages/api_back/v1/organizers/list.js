import { EventOrganiser, ApiSubscription, ApiPlan } from '@/database/models';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const organizers = await EventOrganiser.findAll({
            include: [
                {
                    model: ApiSubscription,
                    as: 'subscriptions',
                    // attributes: ['id', 'status', 'start_date', 'end_date','key_hash',''],
                    include: [
                        {
                            model: ApiPlan,
                            as: 'plan',
                            attributes: ['id', 'name', 'price', 'description']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            total: organizers.length,
            data: organizers
        });
    } catch (err) {
        console.error('Error fetching organizers:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
