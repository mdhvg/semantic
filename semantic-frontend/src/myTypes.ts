export type DocumentRecordMap = {
    [key: string]: DocumentRecord,
}

export type DocumentRecord = {
    color?: string;
    starred?: boolean;
    title: string;
    content: string;
}

export type DocumentLoadStatus = {
    [key: string]: boolean;
}