import { TimeBlock } from "@/types";
import CreateTimeBlockPage from "@/app/dashboard/schedule/timeblock/create/page";
import Modal from "@/app/components/Modals/Modal";

/** Renders the CreateTimeBlock view page in a modal overlay */
function CreateTimeBlockModalPage() {
    return (
        <Modal showBackButton={true}>
            <CreateTimeBlockPage startTime={"00:00"} endTime={"00:00"}/>
        </Modal>
    )
}

export default CreateTimeBlockModalPage;