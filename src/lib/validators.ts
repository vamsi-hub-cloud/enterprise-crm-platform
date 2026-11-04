export type Vals = Record<string, string>;
export type Errs = Record<string, string | undefined>;

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const isPhone = (v: string) => /^[+()\d\s-]{7,20}$/.test(v.trim());

const required = (e: Errs, v: Vals, key: string, label: string) => {
  if (!v[key]?.trim()) e[key] = `${label} is required`;
};
const contact = (e: Errs, v: Vals) => {
  required(e, v, 'email', 'Email');
  if (v.email && !isEmail(v.email)) e.email = 'Enter a valid email, like name@company.com';
  if (v.phone && !isPhone(v.phone)) e.phone = 'Use digits, spaces, + or - (7–20 characters)';
};
const amount = (e: Errs, v: Vals, key = 'value') => {
  if (v[key] === '' || v[key] === undefined) e[key] = 'Enter an amount';
  else if (Number.isNaN(Number(v[key])) || Number(v[key]) < 0) e[key] = 'Amount must be 0 or more';
};

export const validateLead = (v: Vals): Errs => {
  const e: Errs = {};
  required(e, v, 'name', 'Name'); required(e, v, 'company', 'Company'); contact(e, v); amount(e, v);
  return e;
};
export const validateCustomer = (v: Vals): Errs => {
  const e: Errs = {};
  required(e, v, 'name', 'Contact name'); required(e, v, 'company', 'Company'); required(e, v, 'city', 'City');
  contact(e, v); amount(e, v, 'revenue');
  return e;
};
export const validateDeal = (v: Vals): Errs => {
  const e: Errs = {};
  required(e, v, 'title', 'Deal name'); required(e, v, 'company', 'Company'); required(e, v, 'closeDate', 'Close date');
  amount(e, v);
  return e;
};
export const validateTask = (v: Vals): Errs => {
  const e: Errs = {};
  required(e, v, 'title', 'Title'); required(e, v, 'due', 'Due date');
  return e;
};
export const validateActivity = (v: Vals): Errs => {
  const e: Errs = {};
  required(e, v, 'subject', 'Subject'); required(e, v, 'date', 'Date'); required(e, v, 'time', 'Time');
  return e;
};
