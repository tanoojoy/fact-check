import { productTabs } from '../consts/product-tabs';

export const generateMockCompanyProducts = (count = 5) => {
    return Array(count).fill().map((product, ix) => {
        return {
            id: Math.floor(Math.random() * 1000000),
            index: ix + 1,
            isVerified: Math.random() > 0.5,
            name: Math.random().toString(36).substring(2,7),
            get type() {
                const productTypes = Object.values(productTabs).map(tab => tab.productType);
                return productTypes[Math.floor(Math.random() * productTypes.length)];
            },
            updateDate: (() => {
                const start = new Date(2019, 0, 1);
                const end = new Date();
                return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            })()
        };
    });
};
