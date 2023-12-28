import type { AxisBaseOptionCommon } from "echarts/types/src/coord/axisCommonTypes";
import type { CartesianAxisOption } from "echarts/types/src/coord/cartesian/AxisModel";
import type { RenderingContext } from "metabase/visualizations/types";
import type {
  CartesianChartModel,
  Extent,
  YAxisModel,
  XAxisModel,
} from "metabase/visualizations/echarts/cartesian/model/types";

import { CHART_STYLE } from "metabase/visualizations/echarts/cartesian/constants/style";

import type { ChartMeasurements } from "metabase/visualizations/echarts/cartesian/option/types";

import type { XAxisScale } from "metabase-types/api";

const NORMALIZED_RANGE = { min: 0, max: 1 };

const getCustomAxisRange = (
  axisExtent: Extent,
  min: number | undefined,
  max: number | undefined,
) => {
  const [extentMin, extentMax] = axisExtent;
  // if min/max are not specified or within series extents return `undefined`
  // so that ECharts compute a rounded range automatically
  const finalMin = min != null && min < extentMin ? min : undefined;
  const finalMax = max != null && max > extentMax ? max : undefined;

  return { min: finalMin, max: finalMax };
};

const getYAxisRange = (axisModel: YAxisModel) => {
  const isNormalized = axisModel.stacking === "normalized";

  if (axisModel.customRange == null) {
    const defaultRange = isNormalized ? NORMALIZED_RANGE : {};
    return [defaultRange, defaultRange];
  }

  return axisModel.extent
    ? getCustomAxisRange(
        axisModel.extent,
        axisModel.customRange.min,
        axisModel.customRange.max,
      )
    : {};
};

const getAxisNameDefaultOption = (
  { getColor, fontFamily }: RenderingContext,
  nameGap: number,
  name: string | undefined,
  rotate?: number,
): Partial<AxisBaseOptionCommon> => ({
  name,
  nameGap,
  nameLocation: "middle",
  nameRotate: rotate,
  nameTextStyle: {
    color: getColor("text-dark"),
    fontSize: CHART_STYLE.axisName.size,
    fontWeight: CHART_STYLE.axisName.weight,
    fontFamily,
  },
});

const getTicksDefaultOption = ({ getColor, fontFamily }: RenderingContext) => {
  return {
    hideOverlap: true,
    color: getColor("text-dark"),
    fontSize: CHART_STYLE.axisTicks.size,
    fontWeight: CHART_STYLE.axisTicks.weight,
    fontFamily,
  };
};

export const getXAxisType = (axisScale?: XAxisScale) => {
  switch (axisScale) {
    case "timeseries":
      return "time";
    case "linear":
    case "pow":
      return "value";
    case "log":
      return "log";
    // ^ pow and log are only for scatter plot
    default:
      return "category";
  }
};

export const buildDimensionAxis = (
  axisModel: XAxisModel,
  nameGap: number,
  hasTimelineEvents: boolean,
  renderingContext: RenderingContext,
): CartesianAxisOption => {
  const { getColor } = renderingContext;
  const axisType = getXAxisType(axisModel.axisScale);

  const boundaryGap =
    axisType === "value" || axisType === "log"
      ? undefined
      : ([0.02, 0.02] as [number, number]);

  return {
    ...getAxisNameDefaultOption(renderingContext, nameGap, axisModel.label),
    axisTick: {
      show: false,
    },
    boundaryGap,
    splitLine: {
      show: false,
    },
    type: axisType,
    axisLabel: {
      margin:
        CHART_STYLE.axisTicksMarginX +
        (hasTimelineEvents ? CHART_STYLE.timelineEvents.height : 0),
      show: axisModel.hasAxisTicksLabels,
      rotate: axisModel.rotateAngle,
      ...getTicksDefaultOption(renderingContext),
      // Value is always converted to a string by ECharts
      formatter: (value: string) => ` ${axisModel.formatter(value)} `, // spaces force padding between ticks
    },
    axisLine: {
      show: axisModel.hasAxisLine,
      lineStyle: {
        color: getColor("text-dark"),
      },
    },
  };
};

export const buildMetricAxis = (
  axisModel: YAxisModel,
  nameGap: number,
  position: "left" | "right",
  renderingContext: RenderingContext,
): CartesianAxisOption => {
  const shouldFlipAxisName = position === "right";

  const range = getYAxisRange(axisModel);
  const axisType = axisModel.axisScale === "log" ? "log" : "value";

  return {
    type: axisType,
    ...range,
    ...getAxisNameDefaultOption(
      renderingContext,
      nameGap,
      axisModel.label,
      shouldFlipAxisName ? -90 : undefined,
    ),
    splitLine: {
      lineStyle: {
        type: 5,
        color: renderingContext.getColor("border"),
      },
    },
    position,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      margin: CHART_STYLE.axisTicksMarginY,
      show: axisModel.hasAxisTicksLabels,
      ...getTicksDefaultOption(renderingContext),
      // @ts-expect-error TODO: figure out EChart types
      formatter: value => axisModel.formatter(value),
    },
  };
};

const buildMetricsAxes = (
  chartModel: CartesianChartModel,
  chartMeasurements: ChartMeasurements,
  renderingContext: RenderingContext,
): CartesianAxisOption[] => {
  const axes: CartesianAxisOption[] = [];

  if (chartModel.leftAxisModel != null) {
    axes.push(
      buildMetricAxis(
        chartModel.leftAxisModel,
        chartMeasurements.ticksDimensions.yAxisNameGapLeft,
        "left",
        renderingContext,
      ),
    );
  }

  if (chartModel.rightAxisModel != null) {
    axes.push(
      buildMetricAxis(
        chartModel.rightAxisModel,
        chartMeasurements.ticksDimensions.yAxisNameGapRight,
        "right",
        renderingContext,
      ),
    );
  }

  return axes;
};

export const buildAxes = (
  chartModel: CartesianChartModel,
  chartMeasurements: ChartMeasurements,
  hasTimelineEvents: boolean,
  renderingContext: RenderingContext,
) => {
  return {
    xAxis: buildDimensionAxis(
      chartModel.xAxisModel,
      chartMeasurements,
      hasTimelineEvents,
      renderingContext,
    ),
    yAxis: buildMetricsAxes(chartModel, chartMeasurements, renderingContext),
  };
};
