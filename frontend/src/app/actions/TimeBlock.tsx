'use server'

import { API_URL } from '@/constants'
import { TimeBlock } from '@/types'
import { revalidatePath } from 'next/cache'

/**
 * Server side function to create a time block
 * User ID is optional because user may not be logged in
 */
async function createTimeBlock(formData: FormData, userId?: number) {
  const rawFormData = {
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    category: formData.get('category'),
    color: formData.get('color'),
    user_id: userId
  }

  const res = await fetch(`${API_URL}/schedule/block`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(rawFormData)
  })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to add time block')

    return {
      message: 'Failed to add time block'
    }
  }

  revalidatePath('/dashboard/schedule');

  return res.json()
}

/**
 * Server side function to get a time block
 */
async function getTimeBlock(blockId: number): Promise<TimeBlock> {
    const res = await fetch(`${API_URL}/schedule/block/${blockId}`);

    if (!res.ok) {
      throw new Error('Failed to get data')
    }

    return res.json()
}

/**
 * Server side function to update a time block
 */
async function updateTimeBlock(formData: FormData, userId?: number) {
  const rawFormData = {
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    category: formData.get('category'),
    color: formData.get('color'),
    id: formData.get('id'),
    user_id: userId
  }

  const res = await fetch(`${API_URL}/schedule/block/${rawFormData.id}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(rawFormData)
  })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to add time block')

    return {
      ...res.json(),
      message: 'Failed to update time block'
    }
  }

  return {
    ...res.json(),
    message: 'Time block updated successfully'
  }
}

/**
 * Server side function to delete a time block
 */
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

/**
 * Server side function to get categories for a specific user
 * @TODO make this non-user specific if not logged in
 */
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