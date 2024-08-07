import { TimeBlock } from "@/types";
import CreateTimeBlockPage from "@/app/dashboard/schedule/timeblock/create/page";
import Modal from "@/app/components/Modals/modal";

function CreateTimeBlockModalPage() {
    return (
        <Modal>
            <CreateTimeBlockPage />
        </Modal>
    )
}

export default CreateTimeBlockModalPage;