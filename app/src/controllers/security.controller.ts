import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
  requestBody,
  post,
  getModelSchemaRef,
  RequestBodyObject,
} from '@loopback/rest';
import { ServiceBindings } from '../keys';
import { CommonServiceI } from '../services';

export const AppConfigSchema = {
  type: 'object',
  properties: {
    DATA_DIR: {type: 'string'},
    LABELS: {type: 'string'},
    DETECT: {type: 'string'},
    USE_WEBCAM: {type: 'boolean'},
    USE_RADIO: {type: 'boolean'},
    GATEWAY_API: {type: 'string'}
  },
};

const UPDATE_APP_CONFIG_RESPONSE: ResponseObject = {
  description: 'Update App Config Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'AppConfigResponse',
        properties: {
          DATA_DIR: {type: 'string'},
          LABELS: {type: 'string'},
          DETECT: {type: 'string'},
          USE_WEBCAM: {type: 'boolean'},
          USE_RADIO: {type: 'boolean'},
          GATEWAY_API: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class SecurityController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    ) {}

  // Map to `GET /ping`
  @get('/ping')
  @response(200, PING_RESPONSE)
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  @post('/config')
  @response(200, UPDATE_APP_CONFIG_RESPONSE)
  async updateConfig(
    @requestBody({
      content: {
        'application/json': {
          content: {'application/json': {schema: AppConfigSchema}},
        },
      },
    })
    payload: typeof AppConfigSchema,
  ): Promise<any> {
    console.log('IN updateConfig with AppConfig: >>> ', payload);
    await this.commonService.setItemInCache("APP_CONFIG", payload);
    return Promise.resolve(payload);   
  }

}
