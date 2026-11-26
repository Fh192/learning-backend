export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
export type Method = typeof METHODS[number]