const { estimate } = require("../../lib/aws");

/* eslint-disable object-curly-newline */
describe("aws lambda price estimater", () => {
    describe("single function estimation", () => {
        describe("without free tier", () => {
            [
                { executionTime: 1000, executionsPerMin: 1, memory: 1024, expected: 0.68 },
                { executionTime: 5000, executionsPerMin: 1, memory: 256, expected: 0.85 },
                { executionTime: 1000, executionsPerMin: 1, memory: 128, expected: 0.09 },
                { executionTime: 1000, executionsPerMin: 1, memory: 512, expected: 0.34 },
                { executionTime: 1000, executionsPerMin: 1, memory: 1536, expected: 1.02 },
                { executionTime: 5000, executionsPerMin: 1, memory: 1536, expected: 5.05 },
                { executionTime: 5000, executionsPerMin: 10, memory: 1536, expected: 50.49 },
                { executionTime: 5000, executionsPerMin: 100, memory: 3008, expected: 988.00 },
            ].forEach(({ executionTime, executionsPerMin, memory, expected }) =>
                it(`returns price of $${expected} for ${executionsPerMin} execution per minute for 28 days of a ${executionTime}ms function on ${memory}mb RAM`, () => expect(estimate({
                    executions: 40320 * executionsPerMin,
                    executionTime,
                    memory,
                    freeTier: false,
                })).toEqual({
                    currency: "$",
                    total: expected,
                })));
        });

        describe("with free tier", () => {
            [
                { executionTime: 5000, executionsPerMin: 1, memory: 1536, expected: 0.00 },
                { executionTime: 5000, executionsPerMin: 10, memory: 1536, expected: 43.74 },
                { executionTime: 5000, executionsPerMin: 100, memory: 256, expected: 77.96 },
            ].forEach(({ executionTime, executionsPerMin, memory, expected }) =>
                it(`returns price of $${expected} for ${executionsPerMin} executions per minute for 28 days of a ${executionTime}ms function on ${memory}mb RAM`, () => expect(estimate({
                    executions: 40320 * executionsPerMin,
                    executionTime,
                    memory,
                })).toEqual({
                    currency: "$",
                    total: expected,
                })));
        });
    });

    describe("multiple function estimations", () => {
        describe("without free tier", () => {
            it("returns the sum of both functions cost together", () => expect(estimate({
                functions: [
                    {
                        name: "function_a",
                        executions: 40320,
                        executionTime: 5000,
                        memory: 256,
                    },
                    {
                        name: "function_b",
                        executions: 403200,
                        executionTime: 1000,
                        memory: 1024,
                    },
                ],
                freeTier: false,
            })).toEqual({
                functionCosts: {
                    function_a: 0.85,
                    function_b: 6.8,
                },
                total: 7.65,
                currency: "$",
            }));
        });

        describe("with free tier", () => {
            it("returns the sum of both functions cost together", () => expect(estimate({
                functions: [
                    {
                        name: "function_a",
                        executions: 4032000,
                        executionTime: 5000,
                        memory: 256,
                    },
                    {
                        name: "function_b",
                        executions: 403200,
                        executionTime: 1000,
                        memory: 1024,
                    },
                ],
            })).toEqual({
                functionCosts: {
                    function_a: 77.96,
                    function_b: 6.8,
                },
                total: 84.76,
                currency: "$",
            }));
        });
    });
});
