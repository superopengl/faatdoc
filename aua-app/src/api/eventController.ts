
import { Event } from '../entity/Event';
import { createList, createGet, createSave, createDelete } from './genericControllerFactory';

export const listEvent = createList(Event);
export const getEvent = createGet(Event);
export const saveEvent = createSave(Event, 'admin');
export const deleteEvent = createDelete(Event, 'admin');