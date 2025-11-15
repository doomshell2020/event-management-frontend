import { ApiSubscription } from '@/database/models';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { organiser_id, plan_id, start_date, end_date, allowed_domains } = req.body;

    // Basic validation
    if (!organiser_id || !plan_id) {
        return res.status(400).json({
            error: 'organiser_id and plan_id are required'
        });
    }

    try {
        // Set default dates if not provided
        const startDate = start_date || new Date();
        const endDateCalc =
            end_date ||
            new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)); // +1 month

        // Generate smaller API key (16 bytes = 32 chars hex)
        const rawKey = crypto.randomBytes(32).toString('hex');
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

        const subscription = await ApiSubscription.create({
            organiser_id,
            plan_id,
            allowed_domains: allowed_domains || null, // Store null if not provided
            key_hash: keyHash,
            start_date: startDate,
            end_date: endDateCalc,
            status: 'active'
        });

        return res.status(201).json({
            message: 'Subscription created successfully',
            api_key: rawKey, // Return raw API key to client once
            subscription
        });
    } catch (err) {
        console.error('Error creating subscription:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
