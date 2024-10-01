import { BinaryState, Module } from './enum';
import { Route, Status } from './type';

export const ROUTES: Route[] = [
  {
    modules: [Module.CONSOLE],
    path: '/admin',
    name: 'AdminIndex',
    alwaysShow: true,
    meta: {
      title: 'Centre',
      icon: 'el-icon-service',
    },
    children: [
      {
        module: Module.CONSOLE,
        path: 'dashboard',
        name: 'AdminDashboard',
        meta: {
          title: 'Dashboard',
          icon: 'dashboard',
        },
      },
    ],
  },
  {
    modules: [Module.CONTACT, Module.EXCHANGE_RATE],
    path: '/admin',
    name: 'AdminComprehensive',
    alwaysShow: true,
    meta: {
      title: 'Comprehensive',
      icon: 'el-icon-s-data',
    },
    children: [
      {
        module: Module.CONTACT,
        path: 'contact',
        name: 'AdminContacts',
        meta: {
          title: 'Contact',
          icon: 'el-icon-chat-round',
        },
      },
      {
        module: Module.CONTACT,
        path: 'contact/:id',
        name: 'AdminContact',
        meta: {
          title: 'Contact',
          icon: 'el-icon-chat-round',
        },
        hidden: true,
      },
      {
        module: Module.EXCHANGE_RATE,
        path: 'exchange-rate',
        name: 'AdminExchangeRates',
        meta: {
          title: 'Exchange Rate',
          icon: 'el-icon-s-marketing',
        },
      },
      {
        module: Module.EXCHANGE_RATE,
        path: 'exchange-rate/:id',
        name: 'AdminExchangeRate',
        meta: {
          title: 'Exchange Rate',
          icon: 'el-icon-s-marketing',
        },
        hidden: true,
      },
    ],
  },
  {
    modules: [Module.MANAGER, Module.ROLE],
    path: '/admin',
    name: 'AdminPermission',
    alwaysShow: true,
    meta: {
      title: 'Permission',
      icon: 'el-icon-s-management',
    },
    children: [
      {
        module: Module.MANAGER,
        path: 'manager',
        name: 'AdminManagers',
        meta: {
          title: 'Manager',
          icon: 'el-icon-key',
        },
      },
      {
        module: Module.MANAGER,
        path: 'manager/:id',
        name: 'AdminManager',
        meta: {
          title: 'Manager',
          icon: 'el-icon-key',
        },
        hidden: true,
      },
      {
        module: Module.ROLE,
        path: 'role',
        name: 'AdminRoles',
        meta: {
          title: 'Role',
          icon: 'el-icon-open',
        },
      },
      {
        module: Module.ROLE,
        path: 'role/:id',
        name: 'AdminRole',
        meta: {
          title: 'Role',
          icon: 'el-icon-user-solid',
        },
        hidden: true,
      },
    ],
  },
  {
    modules: [Module.SETTING],
    path: '/admin',
    name: 'AdminAdvance',
    alwaysShow: true,
    meta: {
      title: 'Advanced',
      icon: 'el-icon-setting',
    },
    children: [
      {
        module: Module.SETTING,
        path: 'setting',
        name: 'AdminSetting',
        meta: {
          title: 'Setting',
          icon: 'el-icon-s-operation',
        },
      },
    ],
  },
];

export const SwitchStatus: Status = {
  [BinaryState.TRUE]: 'Yes',
  [BinaryState.FALSE]: 'No',
};

export const EnableStatus: Status = {
  [BinaryState.TRUE]: 'Enabled',
  [BinaryState.FALSE]: 'Disabled',
};

export const RecycleStatus: Status = {
  [BinaryState.TRUE]: 'Recycled',
  [BinaryState.FALSE]: 'Non-Recycled',
};
