import { createMockMetadata } from "__support__/metadata";
import { getQuestionSteps } from "metabase/query_builder/components/notebook/lib/steps";
import {
  createSampleDatabase,
  ORDERS,
  ORDERS_ID,
  PRODUCTS,
  PRODUCTS_ID,
  SAMPLE_DB_ID,
} from "metabase-types/api/mocks/presets";

const metadata = createMockMetadata({
  databases: [createSampleDatabase()],
});

const rawDataQuery = {
  "source-table": ORDERS_ID,
};

const summarizedQuery = {
  ...rawDataQuery,
  aggregation: [["count"]],
  breakout: [
    [
      "field",
      PRODUCTS.CATEGORY,
      { "source-field": ORDERS.PRODUCT_ID, "base-type": "type/Integer" },
    ],
  ],
};

const filteredQuery = {
  ...rawDataQuery,
  filter: ["=", ["field", ORDERS.USER_ID, { "base-type": "type/Integer" }], 1],
};

const filteredAndSummarizedQuery = {
  ...summarizedQuery,
  ...filteredQuery,
};

const postAggregationFilterQuery = {
  "source-query": filteredAndSummarizedQuery,
  filter: [">", ["field", "count", { "base-type": "type/Integer" }], 10],
};

const getQuestionStepsForMBQLQuery = query =>
  getQuestionSteps(
    metadata
      .database(SAMPLE_DB_ID)
      .question()
      .legacyQuery()
      .setQuery(query)
      .question(),
  );

describe("new query", () => {
  const steps = getQuestionStepsForMBQLQuery({});
  describe("getQuestionSteps", () => {
    it("should return data step with no actions", () => {
      expect(steps.length).toBe(1);
      expect(steps.map(s => s.type)).toEqual(["data"]);
      expect(steps.map(s => s.actions.map(a => a.type))).toEqual([[]]);
    });
  });
});

describe("raw data query", () => {
  const steps = getQuestionStepsForMBQLQuery(rawDataQuery);
  describe("getQuestionSteps", () => {
    it("should return data step with actions", () => {
      expect(steps.length).toBe(1);
      expect(steps.map(s => s.type)).toEqual(["data"]);
      expect(steps.map(s => s.actions.map(a => a.type))).toEqual([
        ["join", "expression", "filter", "summarize", "sort", "limit"],
      ]);
    });
  });
});

describe("filtered and summarized query", () => {
  const steps = getQuestionStepsForMBQLQuery(filteredAndSummarizedQuery);
  describe("getQuestionSteps", () => {
    it("`getQuestionSteps()` should return data, filter, and summarize steps", () => {
      expect(steps.map(s => s.type)).toEqual(["data", "filter", "summarize"]);
    });
  });
  describe("query", () => {
    it("should be the full query for data step", () => {
      expect(steps[0].query.legacyQuery()).toEqual(filteredAndSummarizedQuery);
    });
    it("should be the full query for filter step", () => {
      expect(steps[1].query.legacyQuery()).toEqual(filteredAndSummarizedQuery);
    });
    it("should be the full query for summarize step", () => {
      expect(steps[2].query.legacyQuery()).toEqual(filteredAndSummarizedQuery);
    });
  });
  describe("previewQuery", () => {
    it("shouldn't include filter, summarize for data step", () => {
      expect(steps[0].previewQuery.legacyQuery()).toEqual(rawDataQuery);
    });
    it("shouldn't include summarize for filter step", () => {
      expect(steps[1].previewQuery.legacyQuery()).toEqual(filteredQuery);
    });
  });
  describe("update", () => {
    it("should remove all steps when changing the table", () => {
      const newQuery = steps[0].update(
        steps[0].query.setTableId(PRODUCTS_ID).datasetQuery(),
      );
      expect(newQuery.legacyQuery()).toEqual({ "source-table": PRODUCTS_ID });
    });
    it("shouldn't remove summarize when removing filter", () => {
      const newQuery = steps[1].update(
        steps[1].revert(steps[1].query).datasetQuery(),
      );
      expect(newQuery.legacyQuery()).toEqual(summarizedQuery);
    });
    it("shouldn't remove filter when removing summarize", () => {
      const newQuery = steps[2].update(
        steps[2].revert(steps[2].query).datasetQuery(),
      );
      expect(newQuery.legacyQuery()).toEqual(filteredQuery);
    });
  });
});

describe("filtered and summarized query with post-aggregation filter", () => {
  const steps = getQuestionStepsForMBQLQuery(postAggregationFilterQuery);
  describe("getQuestionSteps", () => {
    it("`getQuestionSteps()` should return data, filter, summarize, and filter steps", () => {
      expect(steps.map(s => s.type)).toEqual([
        "data",
        "filter",
        "summarize",
        "filter",
      ]);
    });
  });
  describe("query", () => {
    it("should be the source-query for data step", () => {
      expect(steps[0].query.legacyQuery()).toEqual(filteredAndSummarizedQuery);
    });
    it("should be the source-query for filter step", () => {
      expect(steps[1].query.legacyQuery()).toEqual(filteredAndSummarizedQuery);
    });
    it("should be the source-query for summarize step", () => {
      expect(steps[2].query.legacyQuery()).toEqual(filteredAndSummarizedQuery);
    });
    it("should be the original query for post-aggregation filter step", () => {
      expect(steps[3].query.legacyQuery()).toEqual(postAggregationFilterQuery);
    });
  });
  describe("previewQuery", () => {
    it("shouldn't include filter, summarize, or post-aggregation filter for data step", () => {
      expect(steps[0].previewQuery.legacyQuery()).toEqual(rawDataQuery);
    });
    it("shouldn't include summarize or post-aggregation filter filter step", () => {
      expect(steps[1].previewQuery.legacyQuery()).toEqual(filteredQuery);
    });
    it("should be the original query for post-aggregation filter step", () => {
      expect(steps[3].previewQuery.legacyQuery()).toEqual(
        postAggregationFilterQuery,
      );
    });
  });
  describe("update", () => {
    it("should remove all steps when changing the table", () => {
      const newQuery = steps[0].update(
        steps[0].query.setTableId(PRODUCTS_ID).datasetQuery(),
      );
      expect(newQuery.legacyQuery()).toEqual({ "source-table": PRODUCTS_ID });
    });
    it("shouldn't remove summarize or post-aggregation filter when removing filter", () => {
      const newQuery = steps[1].update(
        steps[1].revert(steps[1].query).datasetQuery(),
      );
      expect(newQuery.legacyQuery()).toEqual({
        ...postAggregationFilterQuery,
        "source-query": summarizedQuery,
      });
    });
    it("should remove post-aggregation filter when removing summarize", () => {
      const newQuery = steps[2].update(
        steps[2].revert(steps[2].query).datasetQuery(),
      );
      expect(newQuery.legacyQuery()).toEqual(filteredQuery);
    });
    it("should remove empty layer of nesting but not remove filter or summarize when removing post-aggregation filter", () => {
      const newQuery = steps[3].update(
        steps[3].revert(steps[3].query).datasetQuery(),
      );
      expect(newQuery.legacyQuery()).toEqual(filteredAndSummarizedQuery);
    });
  });
});
