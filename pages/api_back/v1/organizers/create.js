import crypto from 'crypto';
import { EventOrganiser } from '@/database/models';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        member_id,
        organisation_name,
        contact_person,
        contact_email,
        phone,
        website,
        address,
        logo_url
    } = req.body;

    // Basic validation
    if (!member_id || !organisation_name || !contact_email) {
        return res.status(400).json({
            error: 'member_id, organisation_name and contact_email are required'
        });
    }

    try {
        // 1️⃣ Create the organiser
        const organiser = await EventOrganiser.create({
            member_id,
            organisation_name,
            contact_person,
            contact_email,
            phone,
            website,
            address,
            logo_url
        });

        // 5️⃣ Return organiser info + raw key
        return res.status(201).json({
            message: 'Organiser created successfully',
            organiser: {
                id: organiser.id,
                organisation_name: organiser.organisation_name
            },
        });
    } catch (err) {
        console.error('Error creating organiser:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
