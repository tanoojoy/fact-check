import moment from 'moment';
import { ORDER_STATUS } from '../../../consts/payment';
import { subscribe } from '../auth-service/subscription-controller';

module.exports = {
    handlePaymentNotification(status, paymentDate, userId) {
        if (!this.isPaymentStatusPermitted(status)) return;
        const formattedPaymentDate = moment.utc(paymentDate).format();
        const nextPaymentDate = moment.utc(paymentDate).add(1, 'year').format();
        return this.updateUserSubscription(userId, formattedPaymentDate, nextPaymentDate);
    },
    isPaymentStatusPermitted(status) {
        switch (status) {
        case ORDER_STATUS.TEST:
            return process.env.ALLOW_TEST_CLEVERBRIDGE_ORDERS;
        case ORDER_STATUS.PAID:
            return true;
        case ORDER_STATUS.DECLINED:
            return false;
        default:
            return false;
        }
    },
    async updateUserSubscription(userClarivateId, startDate, endDate) {
        const response = await subscribe(userClarivateId, startDate, endDate);
        return response.status;
    }
};
