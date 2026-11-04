import type { Activity, Customer, Deal, Lead, Task } from '@/types';
import { createCrudSlice } from './crudSlice';

export const leadsSlice = createCrudSlice<Lead>('leads');
export const dealsSlice = createCrudSlice<Deal>('deals');
export const customersSlice = createCrudSlice<Customer>('customers');
export const tasksSlice = createCrudSlice<Task>('tasks');
export const activitiesSlice = createCrudSlice<Activity>('activities');
