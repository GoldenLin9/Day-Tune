type User = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
}

type TimeBlock = {
    id: number;
    start_time: number;
    end_time: number;
    category: string;
    color: string;
    // user: User;
}

type Schedule = {
    id: number;
    user: User;
    time_blocks: Array<TimeBlock>;
}

export type { User, TimeBlock, Schedule }