export type DocumentRecordMap = {
    [key: string]: DocumentRecord,
}

export type DocumentRecord = {
    color?: string;
    starred?: boolean;
    title: string;
    content?: string;
    deleted_status?: boolean;
    deleted_timeLeft?: number;
}

export type DocumentFetchType = {
    ids: string[];
    data?: any[];
    documents?: string[];
    embeddings?: number[][];
    metadatas: {
        color?: string;
        starred?: boolean;
        title: string;
        deleted_status?: boolean;
        deleted_timeLeft?: number;
    }[];
    uris: string[];
}
export type DocumentLoadStatus = {
    [key: string]: boolean;
}

export type RenderListType = {
    id: string;
    title: string;
}