'use server'

import { API_URL } from '@/constants'
import { TimeBlock } from '@/types'
import { revalidatePath } from 'next/cache'

async function createTimeBlock(timeBlock: TimeBlock): Promise<TimeBlock> {
  // const res = await fetch(`${API_URL}/schedule/block`, {
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(timeBlock),
  // })

  // if (!res.ok) {
  //   // This will activate the closest `error.js` Error Boundary
  //   throw new Error('Failed to add time block')
  // }

  revalidatePath('/dashboard/schedule');

  return timeBlock;

  // return res.json()
}

async function getTimeBlock(blockId: number): Promise<TimeBlock> {
    const res = await fetch(`${API_URL}/schedule/block/${blockId}`);

    if (!res.ok) {
      throw new Error('Failed to get data')
    }

    return res.json()
}

async function updateTimeBlock(timeBlock: TimeBlock): Promise<Object> {
  const res = await fetch(`${API_URL}/schedule/block/${timeBlock.id}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(timeBlock)
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

async function getCategories(userId: number): Promise<string[]> {
    const res = await fetch(`${API_URL}/${userId}/categories`);

    if (!res.ok) {
      throw new Error('Failed to get data')
    }

    return res.json()
}

export {
    createTimeBlock,
    getTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    getCategories
}