import { expect, assert } from "chai";
import { AppName, StatsStore } from "../src/index";
import * as sinon from "sinon";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { getGUID } from "../src/uuid";

chai.use(chaiAsPromised);

const getDate = () => {
    return "2018-05-16T21:54:24.500Z";
};

describe("StatsStore", function() {
    const version = "1.2.3";
    const store = new StatsStore(AppName.Atom, version);
    describe("reportStats", async function() {
        const fakeEvent = await store.getDailyStats(getDate);
        it("handles success case", async function() {
            const stub = sinon.stub(store, "post").resolves({status: 200});
            await store.reportStats(getDate);
            sinon.assert.calledWith(stub, fakeEvent);
            stub.restore();
        });
        it("handles failure case", async function() {
            const stub = sinon.stub(store, "post").resolves({status: 500});
            await store.reportStats(getDate);
            sinon.assert.calledWith(stub, fakeEvent);
            stub.restore();
        });
    });
    describe("incrementMeasure", async function() {
        it("adds a new measure if it does not exist", async function() {
            const measureName = "commits";
            const measure = await store.getMeasure(measureName);
            assert.deepEqual(measure, {});
            await store.incrementMeasure(measureName);
            const allMeasures = await store.getMeasures();
            // how do I use the name of a symbol here
            assert.deepEqual(allMeasures, {commits: 1});
        });
        it("increments an existing measure", async function() {
            const measureName = "coAuthoredCommits";
            await store.incrementMeasure(measureName);
            const measure = await store.getMeasure(measureName);
            assert.deepEqual(measure, {coAuthoredCommits: 1});
            await store.incrementMeasure(measureName);
            const incrementedMeasure = await store.getMeasure(measureName);
            const foo = await store.getMeasures();
            assert.deepEqual(incrementedMeasure, { coAuthoredCommits: 2});
        });
    });
    describe("getDailyStats", function() {
        it("event has all the fields we expect", async function() {
            const event = await store.getDailyStats(getDate);
            const dimensions = event.dimensions;
            expect(dimensions.accessToken).to.be.null;
            expect(dimensions.version).to.eq(version);
            expect(dimensions.platform).to.eq(process.platform);
            expect(dimensions.date).to.eq(getDate());
            expect(dimensions.eventType).to.eq("usage");
            expect(dimensions.guid).to.eq(getGUID());
        });
    });
});
