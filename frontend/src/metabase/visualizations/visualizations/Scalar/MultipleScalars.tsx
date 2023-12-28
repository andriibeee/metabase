import { useMemo } from "react";
import type { VisualizationProps } from "metabase/visualizations/types";
import { EChartsRenderer } from "metabase/visualizations/components/EChartsRenderer";
import { buildCombinedScalarsModel } from "metabase/visualizations/echarts/cartesian/simple-bar-chart/model";
import { useBrowserRenderingContext } from "metabase/visualizations/hooks/use-browser-rendering-context";
import { buildCombinedScalarsOption } from "metabase/visualizations/echarts/cartesian/simple-bar-chart/option";

export const MultipleScalars = ({
  rawSeries,
  fontFamily,
  width,
  height,
}: VisualizationProps) => {
  const renderingContext = useBrowserRenderingContext(fontFamily);
  const model = useMemo(
    () => buildCombinedScalarsModel(rawSeries, renderingContext),
    [rawSeries, renderingContext],
  );
  const option = useMemo(
    () => buildCombinedScalarsOption(model, renderingContext),
    [model, renderingContext],
  );
  return (
    <EChartsRenderer
      option={option}
      width={width}
      height={height}
    ></EChartsRenderer>
  );
};
