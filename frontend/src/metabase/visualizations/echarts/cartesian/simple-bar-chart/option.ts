import {
  buildDimensionAxis,
  buildMetricAxis,
} from "metabase/visualizations/echarts/cartesian/option/axis";

import type { RenderingContext } from "metabase/visualizations/types";
import type { SimpleBarModel } from "./types";

export const buildCombinedScalarsOption = (
  chartModel: SimpleBarModel,
  renderingContext: RenderingContext,
) => {
  return {
    dataset: {
      source: chartModel.dataset,
    },
    xAxis: buildDimensionAxis(
      chartModel.xAxisModel,
      0,
      false,
      renderingContext,
    ),
    yAxis: buildMetricAxis(chartModel.yAxisModel, 0, "left", renderingContext),
    series: {
      type: "bar",
      encode: {
        x: "x",
        y: "y",
      },
      itemStyle: {
        color: function (params) {
          return params.data.color;
        },
      },
    },
  };
};
