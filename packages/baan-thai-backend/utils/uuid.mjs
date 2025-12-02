import { v4 as uuid } from 'uuid';

export const generateId = (count) => {
    return uuid().substring(0, count);
}