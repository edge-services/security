import { model, property} from '@loopback/repository';
import { BaseEntity } from './base-entity.model';

@model({settings: {strict: false}})
export class SystemInfo extends BaseEntity {

  @property({
    type: 'string',
    id: true,
    required: false,
    defaultFn: "uuidv4"
  })
  id?: string;

  @property({
    type: 'object',
    required: false,
  })
  cpu: object | undefined;

  @property({
    type: 'object',
    required: false,
  })
  mem: object;

  @property({
    type: 'object', 
    required: false,   
  })
  battery: object| undefined;

  @property({
    type: 'object',
    required: false,
  })
  osInfo: object| undefined;

  @property({
    type: 'object',
    required: false,
  })
  currentLoad: object| undefined;

  @property({
    type: 'object',
  })
  networkStats: object| undefined;

  @property({
    type: 'object',
  })
  other: any| undefined;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<SystemInfo>) {
    super(data);
  }
}

export interface SystemInfoRelations {
  // describe navigational properties here
}

export type SystemInfoWithRelations = SystemInfo & SystemInfoRelations;
