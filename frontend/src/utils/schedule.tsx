'use server'

import { API_URL } from '@/constants'
import { Schedule } from '@/types'

async function getSchedule(): Promise<Schedule> {
    const res = await fetch(`${API_URL}/schedule`)

    if (!res.ok) {
      throw new Error('Failed to fetch schedule')
    }

    return res.json()
}

export {
    getSchedule
}