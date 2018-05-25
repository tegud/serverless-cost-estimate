const { getFreeTier } = require("../../lib/aws/free-tier");

describe("aws free tier", () => {
    describe("free tier not included", () => {
        it("use requests returns number passed in", () => expect(getFreeTier({ freeTier: false }).useRequests(1)).toBe(1));

        it("use time returns number passed in", () => expect(getFreeTier({ freeTier: false }).useTime(1, 1)).toBe(1));
    });

    describe("free tier included", () => {
        it("use requests returns 0 when requests are within the free limit", () => expect(getFreeTier({}).useRequests(1)).toBe(0));

        it("use requests returns number of requests over free limit when requests goes over", () => {
            const freeTier = getFreeTier({});

            freeTier.useRequests(999999);

            expect(freeTier.useRequests(2)).toBe(1);
        });

        describe("use time", () => {
            it("use time returns 0 when requests are within the free limit", () => expect(getFreeTier({}).useTime(1, 1)).toBe(0));

            describe("memory factor 1 (1024mb)", () => {
                it("use time returns 1000 when time is over free limit by one second", () => {
                    const freeTier = getFreeTier({});

                    freeTier.useTime(399999000, 1);

                    expect(freeTier.useTime(2000, 1)).toBe(1000);
                });
            });

            describe("memory factor 2 (2048mb)", () => {
                it("use time returns 1500 when time is over free limit by one second", () => {
                    const freeTier = getFreeTier({});

                    freeTier.useTime(399999000, 1);

                    expect(freeTier.useTime(2000, 2)).toBe(1500);
                });

                it("use time returns 4000 when time is over free limit by four seconds", () => expect(getFreeTier({}).useTime(200004000, 2)).toBe(4000));
            });

            describe("memory factor 0.5 (512mb)", () => {
                it("use time returns 4000 when time is over free limit by four seconds", () => expect(getFreeTier({}).useTime(800004000, 0.5)).toBe(4000));
            });
        });
    });
});
