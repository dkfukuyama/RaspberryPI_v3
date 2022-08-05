"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
describe("date-fns_testcode", () => {
    it("formatted_output_01", () => {
        const DATE_FORMAT = 'yyyy-MM-dd';
        const lastMonth = () => (0, date_fns_1.subMonths)(new Date(), 1);
        const defaultDateStringFrom = () => (0, date_fns_1.format)((0, date_fns_1.startOfMonth)(lastMonth()), DATE_FORMAT);
        const defaultDateStringTo = () => (0, date_fns_1.format)((0, date_fns_1.endOfMonth)(lastMonth()), DATE_FORMAT);
        console.log(defaultDateStringFrom());
        console.log(defaultDateStringTo());
    });
});
//# sourceMappingURL=UnitTest2.js.map