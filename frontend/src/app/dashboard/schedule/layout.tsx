export default function ScheduleLayout({
    modal,
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
    modal: React.ReactNode
}) {
    return (
        <section>
            {children}
            {modal}
            <div id="modal-root" />
        </section>
    )
}