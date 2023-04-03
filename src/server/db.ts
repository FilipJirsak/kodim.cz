import mongoose from 'mongoose';

export interface Claims {
  content: string[],
  web: string[],
}

export interface Group {
  name: string,
  title: string,
  inviteToken?: string,
  claims: Claims,
}

export const groupSchema = new mongoose.Schema<Group>({
  name: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  inviteToken: { type: String, unique: true },
  claims: { type: { content: [String], web: [String] }, required: true },
});

export const GroupModel = mongoose.model<Group>('Group', groupSchema);

export interface User {
  login: string,
  name: string,
  email?: string,
  password?: string,
  avatarUrl: string,
  groups: Group[],
}

export const userSchema = new mongoose.Schema<User>({
  login: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String },
  avatarUrl: { type: String, required: true },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
});

export const UserModel = mongoose.model<User>('User', userSchema);
