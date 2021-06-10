import {BindingKey} from '@loopback/context';
import { DetectionServiceI, CommonServiceI, RuleServiceI, RadioServiceI, SecurityServiceI, CameraServiceI } from './services/types';
import { SimulatorUtilityI } from './utils';

export namespace ServiceBindings {

  export const COMMON_SERVICE = BindingKey.create<CommonServiceI | undefined>(
    'common.service',
  );

  export const RULE_SERVICE = BindingKey.create<RuleServiceI | undefined>(
    'rule.service',
  );

  export const RADIO_SERVICE = BindingKey.create<RadioServiceI | undefined>(
    'radio.service',
  );

  export const DETECTION_SERVICE = BindingKey.create<DetectionServiceI | undefined>(
    'detection.service',
  );

  export const CAMERA_SERVICE = BindingKey.create<CameraServiceI | undefined>(
    'camera.service',
  );

  export const SECURITY_SERVICE = BindingKey.create<SecurityServiceI | undefined>(
    'security.service',
  );

}

export namespace UtilityBindings {

  export const SIMULATOR_UTILITY = BindingKey.create<SimulatorUtilityI | undefined>(
    'simulator.utility',
  );
  
}