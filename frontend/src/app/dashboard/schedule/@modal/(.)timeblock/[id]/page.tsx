import { TimeBlock } from "@/types";
import TimeBlockPage from "@/app/dashboard/schedule/timeblock/[id]/page";
import Modal from "@/app/components/Modals/modal";

function TimeBlockModalPage({
    params: { id }
} : {
    params: { id: string }
}) {
    return (
        <Modal>
            <TimeBlockPage params={{id}} />
        </Modal>
    )
}

export default TimeBlockModalPage;