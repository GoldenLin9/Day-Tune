'use server'

import { API_URL } from '@/constants'
import { TimeBlock } from '@/types'

async function createTimeBlock(start_time: number, end_time: number, category: string): Promise<TimeBlock> {
  const res = await fetch(`${API_URL}/schedule/block`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start_time,
        end_time,
        category
      }),
  })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to add time block')
  }

  return res.json()
}

async function getTimeBlock(blockId: number): Promise<TimeBlock> {
    const res = await fetch(`${API_URL}/schedule/block/${blockId}`);

    if (!res.ok) {
      throw new Error('Failed to get data')
    }

    return res.json()
}

async function updateTimeBlock(blockId: number, formData: FormData): Promise<Object> {
  const res = await fetch(`${API_URL}/schedule/block/${blockId}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: formData
  })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to add time block')
  }

  return {
    message: 'Time block updated successfully'
  }
}

async function deleteTimeBlock(blockId: number): Promise<boolean> {
    const res = await fetch(`${API_URL}/schedule/block/${blockId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(blockId)
    })

    if (!res.ok) {
      throw new Error('Failed to delete data')
    }

    return true
}

export {
    createTimeBlock,
    getTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
}