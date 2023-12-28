import type { RawSeries } from "metabase-types/api";
import { getColorsForValues } from "metabase/lib/colors/charts";

import type {
  XAxisModel,
  YAxisModel,
} from "metabase/visualizations/echarts/cartesian/model/types";
import type { RenderingContext } from "metabase/visualizations/types";
import type {
  SimpleBarModel,
  SimpleBarSeriesModel,
} from "metabase/visualizations/echarts/cartesian/simple-bar-chart/types";

export const buildCombinedScalarsModel = (
  rawSeries: RawSeries,
  renderingContext: RenderingContext,
): SimpleBarModel => {
  const cardNames = rawSeries.map(series => series.card.name);
  const colorByName = getColorsForValues(cardNames);

  const dataset = rawSeries.map(series => {
    return {
      x: series.card.name,
      y: series.data.rows[0][0],
      color: colorByName[series.card.name],
    };
  });

  const xAxisModel: XAxisModel = {
    formatter: (value: unknown) => String(value),
    axisScale: "ordinal",
    hasAxisLine: true,
    hasAxisTicksLabels: true,
  };

  const yAxisModel: YAxisModel = {
    formatter: (value: unknown) => String(value),
    hasAxisTicksLabels: true,
  };

  const series: SimpleBarSeriesModel = {
    name: "combined-scalar",
    colorDataKey: "color",
    dataKey: "y",
  };

  return {
    dataset,
    xAxisModel,
    yAxisModel,
    series,
  };
};
