import { App } from './dto';
import { Module } from './enum';

export type Actions = Record<string, string>;

export type Status = Record<number, string>;

export type Meta = {
  title: string;
  icon: string;
};

export type ChildrenRoute = {
  module: Module;
  path: string;
  name: string;
  meta: Meta;
  hidden?: boolean;
};

export type Route = {
  modules: Module[];
  path: string;
  name: string;
  alwaysShow?: boolean;
  meta: Meta;
  children?: ChildrenRoute[];
  hidden?: boolean;
};

export type EnumSource = Record<string, string | number>;

export type GetAppResult = App;

export type LikeAppResult = void;
