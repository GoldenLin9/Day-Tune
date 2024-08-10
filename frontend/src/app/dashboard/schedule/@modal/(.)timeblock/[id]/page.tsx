import { TimeBlock } from "@/types";
import Modal from "@/app/components/Modals/Modal";
import TimeBlockLayout from "../../../timeblock/layout";

/** Renders the TimeBlock view page in a modal overlay */
function TimeBlockModalPage({
    params: { id }
} : {
    params: { id: string }
}) {
    return (
        <Modal showBackButton={false}>
            <TimeBlockLayout params={{id}} />
        </Modal>
    )
}

export default TimeBlockModalPage;