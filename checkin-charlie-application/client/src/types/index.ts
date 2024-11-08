import { Role } from '../enums';

/** defining data types **/

export type Message = {
  id: string;
  role: Role;
  message: string;
};

export type Conversations = Array<Message>;
