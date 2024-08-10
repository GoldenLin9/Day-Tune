'use client'

import { useFormStatus } from 'react-dom'

/** A button to be used in forms that use actions */
export function SubmitButton({ styles, text } : { styles: string, text: string }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} className={styles}>
      {text}
    </button>
  )
}