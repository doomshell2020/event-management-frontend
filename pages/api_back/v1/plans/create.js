import { ApiPlan } from '@/database/models';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, price, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Plan name is required' });
    }

    try {
        const plan = await ApiPlan.create({
            name,
            price: price || 0,
            description: description || ''
        });

        return res.status(201).json({
            message: 'Plan created successfully',
            plan
        });
    } catch (err) {
        console.error('Error creating plan:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
