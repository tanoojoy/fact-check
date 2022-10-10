const microservices = require('../../src/horizon-settings').microservices;
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ARGUMENT = {
    USERNAME: 'username',
    SSH_KEY_PATH: 'ssh-key-path'
};

const protocol = 'http://';

const indent = '  ';

(async function() {
    const args = process.argv.slice(2);
    const argumentsMap = new Map(args.map(arg => arg.split('=')));
    const username = argumentsMap.get(ARGUMENT.USERNAME);
    const sshKeyPath = argumentsMap.get(ARGUMENT.SSH_KEY_PATH);
    let initialLocalPort = 8081;

    const servicesIP = await Promise.all(Object.keys(microservices).map(async(msKey) => {
        try {
            const serviceAddress = await getServiceAddress(microservices[msKey]);
            return serviceAddress ? serviceAddress.replace(protocol, '') : '';
        } catch (e) {
            console.log('something went wrong', e);
        }
    }));

    const sshConfigTemplate = generateSshConfigTemplate(username, servicesIP, sshKeyPath);

    fs.writeFile(`./${path.relative(process.cwd(), __dirname)}/config`, sshConfigTemplate, (err) => {
        if (err) return console.log(err);
        console.log('Config succesfully created');
    });

    async function getServiceAddress(serviceName) {
        console.log('serviceName', serviceName);
        const envAddress = process.env['SERVICE_' + serviceName + '_ADDRESS'];
        const eurekaUrl = process.env.EUREKA_URL;
        if (!eurekaUrl) {
            console.log('EUREKA_URL is missed, using address from local config ');
            return Promise.resolve(envAddress);
        }
        let response;
        try {
            response = await axios.get(eurekaUrl + '/' + serviceName);
        } catch (e) {
            console.log('-------error response', response, '; serviceName', serviceName);
        }
        const { application } = response.data ? response.data : undefined;
        const instances = Array.isArray(application.instance) ? application.instance : [application.instance]; // {key:value} || undefined
        const availableInstances = instances.filter(instance => instance.status === 'UP' && instance.vipAddress === envAddress);
        const serviceAddress = availableInstances.length > 0 ? `http://${availableInstances[0].ipAddr}:${availableInstances[0].port.$}` : null;
        console.log('Service ', serviceName, ' url from Eureka ', serviceAddress);
        return serviceAddress;
    }

    function generateSshConfigTemplate(username, servicesIP, sshKeyPath) {
        const servicesIpString = servicesIP.map((ip, idx) => `LocalForward ${initialLocalPort++} ${ip}`).join(`\n${indent}`);
        let sshConfigTemplate = `Host us_west_bastion
  ${servicesIpString}
  User ${username}
  HostName bastion-ad.us-west-2.dev-cortellis.com
  ServerAliveInterval 60`;
        if (sshKeyPath) {
            sshConfigTemplate += `\n${indent}IdentityFile ${sshKeyPath}`;
        }
        return sshConfigTemplate;
    }
})();
