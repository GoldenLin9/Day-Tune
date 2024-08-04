'use server'

import { API_URL } from '@/constants'
import { TimeBlock } from '@/types'

async function createTimeBlock(timeBlock: TimeBlock): Promise<TimeBlock> {
  const res = await fetch(`${API_URL}/schedule/block`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(timeBlock)
  })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to add data')
  }

  return res.json()
}

async function getTimeBlock(timeBlockId: number): Promise<TimeBlock> {
    const res = await fetch(`${API_URL}/schedule/block`)

    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }

    return res.json()
}

async function updateTimeBlock(timeBlock: TimeBlock): Promise<TimeBlock> {
    const res = await fetch(`${API_URL}/schedule/block`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeBlock)
    })

    if (!res.ok) {
      throw new Error('Failed to update data')
    }

    return res.json()
}

async function deleteTimeBlock(timeBlock: TimeBlock): Promise<boolean> {
    const res = await fetch(`${API_URL}/schedule/block`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeBlock)
    })

    if (!res.ok) {
      throw new Error('Failed to delete data')
    }

    return res.json()
}

export {
    createTimeBlock,
    getTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
}