import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import * as dgram from 'dgram';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { MagicTVPlatformAccessory } from './platformAccessory';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class MagicTVHomebridgePlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

    public readonly accessories: PlatformAccessory[] = [];

    constructor(
        public readonly log: Logger,
        public readonly config: PlatformConfig,
        public readonly api: API,
    ) {
        this.log.debug('Finished initializing platform:', this.config.name);

        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            this.discoverDevices();
        });
    }
    configureAccessory(accessory: PlatformAccessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        this.accessories.push(accessory);
    }
    removeAccessory(accessory: PlatformAccessory) {
        this.log.info('Removing accessory from cache:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
    discoverDevices() {
        const uuid = this.api.hap.uuid.generate(this.config.ipaddress);

        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
            // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
            // existingAccessory.context.device = device;
            // this.api.updatePlatformAccessories([existingAccessory]);

            // create the accessory handler for the restored accessory
            // this is imported from `platformAccessory.ts`
            new MagicTVPlatformAccessory(this, existingAccessory, this.api);
        } else {
            const magicTVHomebridgePlatform = this;
            const gainInfo = Buffer.from([0x55, 0x00, 0x00, 0x40, 0x40, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0xAA]);
            const returnOK = Buffer.from([0x55, 0x00, 0x00, 0x80, 0x40, 0x06, 0x00, 0x01, 0x10, 0x02, 0x00, 0x04, 0x00, 0xAA]);

            const client = dgram.createSocket('udp4');

            client.on("message", function(msg, rinfo) {
                client.close();
                if (msg.compare(returnOK) === 1) {
                    let modelName = "";
                    let modelNameStart = false;
                    for (let i = 0; i < msg.length; i++) {
                        let buf = msg.slice(i, i + 1);
                        if (!modelNameStart && buf.compare(Buffer.from([0x5A])) === 0) {
                            modelNameStart = true;
                        } else if (modelNameStart) {
                            if (modelName != "" && buf.compare(Buffer.from([0x00])) === 0) {
                                break;
                            }
                            modelName += buf.toString();
                        }
                    }
                    magicTVHomebridgePlatform.log.debug('Updated platform name to', modelName);
                    magicTVHomebridgePlatform.log.info('Adding new accessory:', modelName);
                    const accessory = new magicTVHomebridgePlatform.api.platformAccessory(modelName, uuid, magicTVHomebridgePlatform.api.hap.Categories.TELEVISION);
                    // store a copy of the device object in the `accessory.context`
                    // the `context` property can be used to store any data about the accessory you may need
                    accessory.context.device = { displayName: modelName };
                    new MagicTVPlatformAccessory(magicTVHomebridgePlatform, accessory, magicTVHomebridgePlatform.api);
                    magicTVHomebridgePlatform.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
                }
            });
            this.log.debug('Requesting name from', this.config.ipaddress);
            client.send(gainInfo, 0, gainInfo.length, 23456, this.config.ipaddress, (err, bytes) => {});
        }
    }
}