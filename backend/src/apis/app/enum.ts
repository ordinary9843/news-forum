export enum ServerMode {
  PROD = 'prod',
  DEV = 'dev',
  LOCAL = 'local',
}

export enum QueueType {
  EMAIL = 'email',
}

export enum Module {
  CONSOLE = 'console',
  SETTING = 'setting',
  MANAGER = 'manager',
  ROLE = 'role',
  EXCHANGE_RATE = 'exchange-rate',
  CONTACT = 'contact',
}

export enum Action {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum BinaryState {
  TRUE = 1,
  FALSE = 0,
}
