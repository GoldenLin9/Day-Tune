import { Suspense } from 'react'
import TimeBlockPage from './page'
import Loading from './loading'

export default function TimeBlocks({
    params: { id }
} : {
    params: { id: string }
}) {
    return (
        <Suspense fallback={<Loading />}>
            <TimeBlockPage params={{id}} />
        </Suspense>
    )
}