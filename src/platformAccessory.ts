import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import * as dgram from 'dgram';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { MagicTVHomebridgePlatform } from './platform';

export class MagicTVPlatformAccessory {
    private serviceTV: Service;
    private serviceVolume: Service;

    /**
     * These are just used to create a working example
     * You should implement your own code to track the state of your accessory
     */
    private states = {
        mute: false,
    };

    constructor(
        private readonly platform: MagicTVHomebridgePlatform,
        private readonly accessory: PlatformAccessory,
        private readonly api,
    ) {
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation) !
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        this.serviceTV = this.accessory.getService(this.platform.Service.Television) || this.accessory.addService(this.platform.Service.Television);
        this.serviceTV.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
        this.serviceTV.setCharacteristic(this.platform.Characteristic.ConfiguredName, accessory.context.device.displayName);
        this.serviceTV.setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode, this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        this.serviceTV.getCharacteristic(this.platform.Characteristic.Active).onSet((newValue) => {
            this.platform.log.info('set active', newValue);
        });
        this.serviceTV.setCharacteristic(this.platform.Characteristic.ActiveIdentifier, 1);
        this.serviceTV.getCharacteristic(this.platform.Characteristic.ActiveIdentifier).onSet((newValue) => {
            this.platform.log.info('set active identifier', newValue);
        });

        const client = dgram.createSocket('udp4');
        this.serviceTV.getCharacteristic(this.platform.Characteristic.RemoteKey).onSet((newValue) => {
            switch (newValue) {
                case this.platform.Characteristic.RemoteKey.REWIND:
                    {
                        this.platform.log.info('set Remote Key Pressed: REWIND');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.FAST_FORWARD:
                    {
                        this.platform.log.info('set Remote Key Pressed: FAST_FORWARD');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.NEXT_TRACK:
                    {
                        this.platform.log.info('set Remote Key Pressed: NEXT_TRACK');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.PREVIOUS_TRACK:
                    {
                        this.platform.log.info('set Remote Key Pressed: PREVIOUS_TRACK');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.ARROW_UP:
                    {
                        this.platform.log.info('set Remote Key Pressed: ARROW_UP');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.ARROW_DOWN:
                    {
                        this.platform.log.info('set Remote Key Pressed: ARROW_DOWN');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.ARROW_LEFT:
                    {
                        this.platform.log.info('set Remote Key Pressed: ARROW_LEFT');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.ARROW_RIGHT:
                    {
                        this.platform.log.info('set Remote Key Pressed: ARROW_RIGHT');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.SELECT:
                    {
                        this.platform.log.info('set Remote Key Pressed: SELECT');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.BACK:
                    {
                        this.platform.log.info('set Remote Key Pressed: BACK');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.EXIT:
                    {
                        this.platform.log.info('set Remote Key Pressed: EXIT');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.PLAY_PAUSE:
                    {
                        this.platform.log.info('set Remote Key Pressed: PLAY_PAUSE');
                        break;
                    }
                case this.platform.Characteristic.RemoteKey.INFORMATION:
                    {
                        this.platform.log.info('set Remote Key Pressed: INFORMATION');
                        break;
                    }
            }
        });

        this.serviceVolume = this.accessory.getService(this.platform.Service.TelevisionSpeaker) || this.accessory.addService(this.platform.Service.TelevisionSpeaker);
        this.serviceVolume.getCharacteristic(this.platform.Characteristic.Mute).onGet(() => {
            this.platform.log.info('get Mute:', this.states.mute);
            return this.states.mute;
        }).onSet((newValue) => {
            this.states.mute = newValue == 1;
            this.platform.log.info('set Mute:', newValue);
        });
        // this.serviceVolume.getCharacteristic(this.platform.Characteristic.Volume).onGet(() => {
        //     this.platform.log.info('get Volume:', this.states.volume);
        //     return this.states.volume;
        // }).onSet((newValue) => {
        //     this.states.volume = newValue;
        //     this.platform.log.info('set Volume:', newValue);
        // });
        this.serviceVolume.setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE)
            .setCharacteristic(this.platform.Characteristic.VolumeControlType, this.platform.Characteristic.VolumeControlType.ABSOLUTE);
        this.serviceVolume.getCharacteristic(this.platform.Characteristic.VolumeSelector).onSet((newValue) => {
            switch (newValue) {
                case this.platform.Characteristic.VolumeSelector.INCREMENT:
                    break;
                case this.platform.Characteristic.VolumeSelector.DECREMENT:
                    break;
            }
            this.platform.log.info('set VolumeSelector => setNewValue: ' + newValue);
        });

        this.platform.log.info('Successfully started service');
        // this.api.publishExternalAccessories(PLUGIN_NAME, [this.accessory]);
    }

}