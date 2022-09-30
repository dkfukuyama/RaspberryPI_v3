import assert = require('assert');
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

describe("date-fns_testcode", () => {
    it("formatted_output_01", () => {
        const DATE_FORMAT = 'yyyy-MM-dd';
        const lastMonth = (): Date => subMonths(new Date(), 1);
        const defaultDateStringFrom = (): string => format(startOfMonth(lastMonth()), DATE_FORMAT);
        const defaultDateStringTo = (): string => format(endOfMonth(lastMonth()), DATE_FORMAT);
        console.log(defaultDateStringFrom());
        console.log(defaultDateStringTo());
    });
});
