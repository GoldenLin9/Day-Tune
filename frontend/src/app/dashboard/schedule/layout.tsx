import { Metadata } from "next"
import { Suspense } from "react"

// Static metadata
export const metadata: Metadata = {
    title: 'Schedule',
  }

export default function ScheduleLayout({
    modal,
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
    modal: React.ReactNode
}) {
    return (
        <section>
            <Suspense fallback={<p>Loading schedule...</p>}>
                {children}
                {modal}
                <div id="modal-root" />
            </Suspense>
        </section>
    )
}