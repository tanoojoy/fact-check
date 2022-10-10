"use strict";
import { 
    InviteColleaguesEmailContentTemplate,
    ShareProductEmailContentTemplate,
    UserActionEmailTemplate
} from '../edm-templates/index';
import { getAppPrefix } from '../common';
import { param } from 'jquery';

const appPrefix = getAppPrefix();

const clarivateEmail = 'no-reply@clarivate.com';
const clarivateLogo = `https://www.snapshot.dev-cortellis.com${appPrefix}/assets/images/horizon/logo_clarivate_connect.png`;
const registerLink = `https://access.snapshot.dev-cortellis.com/register?app=scn`;
const loginLink = `https://access.snapshot.dev-cortellis.com/login?app=scn`;
const clarivateFooterLink = `https://www.snapshot.dev-cortellis.com${appPrefix}/assets/images/horizon/clarivate_logo_tm_white.png`;
const mainPageLink = `https://www.snapshot.dev-cortellis.com${appPrefix}`;

const HorizonEdmStaticModule = (() => {
    return {
        GetTemplateTypes: () => {
            return {
                Invite_Colleagues_EDM: 'Invite Colleagues',
                Share_Product_EDM: 'Share Product',
                Create_RFQ_QUOTE_EDM: 'RFQ Quote User Actions'
            }
        },
        GetParameters: () => {
            return {
                Recipients: '{{ Recipients }}',
                ProductName: '{{ ProductName }}',
                InviteComment: '{{ InviteComment }}',
                LogoLink: '{{ LogoLink }}',
                InviteUserEmail: '{{ InviteUserEmail }}',
                RegisterLink: '{{ RegisterLink }}',
                Notification: '{{ Notification }}',
                AccessLink: '{{ AccessLink }}',
                FooterLogoLink: '{{ FooterLogoLink }}',
                MainPageLink: '{{ MainPageLink }}',
                ProductComment: '{{ ProductComment }}',
                CompanyName: '{{ CompanyName }}',
                NotificationTitle: '{{ NotificationTitle }}',
                NotificationMessage: '{{ NotificationMessage }}',
                InboxLink: '{{ InboxLink }}',
                SettingsLink: '{{ SettingsLink }}'
            }
        },
        GetTemplates: () => {
            return {
                'Invite Colleagues': {
                    From: clarivateEmail,
                    To: '{{ Recipients }}',
                    BCC: null,
                    CC: null,
                    Subject: 'Join me on Cortellis Supply Chain Network',
                    Body: InviteColleaguesEmailContentTemplate
                },
                'Share Product': {
                    From: clarivateEmail,
                    To: '{{ Recipients }}',
                    BCC: null,
                    CC: null,
                    Subject: 'Check out this {{ ProductName }} product listing on Cortellis Supply Chain Network',
                    Body: ShareProductEmailContentTemplate
                },
                'RFQ Quote User Actions': {
                    From: clarivateEmail,
                    To: '{{ Recipients }}',
                    BCC: null,
                    CC: null,
                    Subject: 'New Supply Chain Network Activity',
                    Body: UserActionEmailTemplate
                }
            }
        },
        GetCommonParameters: function () {
            return [
                {
                    key: this.GetParameters().LogoLink,
                    value: clarivateLogo
                },
                {
                    key: this.GetParameters().RegisterLink,
                    value: registerLink
                },
                {
                    key: this.GetParameters().FooterLogoLink,
                    value: clarivateFooterLink
                },
                {
                    key: this.GetParameters().MainPageLink,
                    value: mainPageLink
                }
            ];
        },
        MapCustomEmailTemplateDataToTemplate: function (data) {
            const defaultTemplate = this.GetTemplates()[data.title] || {};

            return {
                From: clarivateEmail,
                To: '{{ Recipients }}',
                BCC: data.bcc || defaultTemplate?.BCC || null,
                CC: data.cc || defaultTemplate?.CC || null,
                Subject: data.subject || defaultTemplate?.Subject || '',
                Body: data.content || defaultTemplate?.Body || ''
            };
        },
        MapInviteColleagueDataToParameters: function (data) {
            const parameters = this.GetCommonParameters();
           
            parameters.push({
                key: this.GetParameters().Recipients,
                value: data.recipients
            });

            parameters.push({
                key: this.GetParameters().InviteComment,
                value: data?.comment || ''
            });

            parameters.push({
                key: this.GetParameters().InviteUserEmail,
                value: data?.senderUserEmail
            });

            parameters.push({
                key: this.GetParameters().AccessLink,
                value: loginLink
            });

            return parameters;
        },
        MapShareProductDataToParameters: function (data) {
            const parameters = this.GetCommonParameters();
           
            parameters.push({
                key: this.GetParameters().Recipients,
                value: data.recipients
            });

            parameters.push({
                key: this.GetParameters().ProductComment,
                value: data.comment
            });

            parameters.push({
                key: this.GetParameters().ProductName,
                value: data.productName
            });

            parameters.push({
                key: this.GetParameters().CompanyName,
                value: data.companyName
            });

            parameters.push({
                key: this.GetParameters().InviteUserEmail,
                value: data.senderUserEmail
            });

            parameters.push({
                key: this.GetParameters().AccessLink,
                value: `${mainPageLink}${data.productLink}`
            });

            return parameters;
        },
        MapUserActionCreateRfqDataToParameters: function (data) {
            console.log('data', data);
            const parameters = this.GetCommonParameters();
            parameters.push({
                key: this.GetParameters().NotificationTitle,
                value: data.notificationTitle
            });

            parameters.push({
                key: this.GetParameters().NotificationMessage,
                value: data.notificationMessage
            });

            parameters.push({
                key: this.GetParameters().InboxLink,
                value: data.inboxLink
            });

            parameters.push({
                key: this.GetParameters().SettingsLink,
                value: data.settingsLink
            });

            return parameters;
        },
        MapDataToHorizonEdmParameters: function (type, data) {
            let parameters = [];
            const edmTemplateTypes = this.GetTemplateTypes();

            switch(type) {
                case edmTemplateTypes.Invite_Colleagues_EDM:
                    parameters = this.MapInviteColleagueDataToParameters(data);
                    break;
                case edmTemplateTypes.Share_Product_EDM:
                    parameters = this.MapShareProductDataToParameters(data);
                    break;
                case edmTemplateTypes.Create_RFQ_QUOTE_EDM:
                    parameters = this.MapUserActionCreateRfqDataToParameters(data);
                    break;
                default:
                    break;
            }
            return parameters;
        }
    };
})();

module.exports = HorizonEdmStaticModule;