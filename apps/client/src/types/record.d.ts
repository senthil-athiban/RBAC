export interface Record {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}


export interface GetRecordResponse {
  records: Array<Record>;
}