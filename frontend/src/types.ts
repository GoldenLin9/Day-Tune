type User = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
}

// Defined like the backend models
type TimeBlock = {
    id: number;
    start_time: string;
    end_time: string;
    category: string;
    color: string;
    user?: User;
    children: Array<TimeBlock>;
}

type Schedule = {
    id: number;
    user: User;
    time_blocks: Array<TimeBlock>;
}

type ErrorDetail = {
    field: string;
    messages: Array<string>;
};

type Errors = ErrorDetail[];

export type { User, TimeBlock, Schedule, Errors }