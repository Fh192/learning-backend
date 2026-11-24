export interface Note {
    id: number,
    title: string,
    content: string,
    createdAt: string,
    updatedAt: string
}

export type CreateNoteDto = Pick<Note, 'title' | 'content'>
export type UpdateNoteDto = Partial<Pick<Note, 'title' | 'content'>>
