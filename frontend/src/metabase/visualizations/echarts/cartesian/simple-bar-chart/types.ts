import type { RowValue } from "metabase-types/api";
import type {
  BaseSeriesModel,
  DataKey,
  XAxisModel,
  YAxisModel,
} from "metabase/visualizations/echarts/cartesian/model/types";

export type SimpleBarDatum = {
  x: string;
  y: RowValue;
  color: string;
};

export type SimpleBarDataset = SimpleBarDatum[];

export type SimpleBarSeriesModel = BaseSeriesModel & {
  colorDataKey: DataKey;
};

export type SimpleBarModel = {
  dataset: SimpleBarDataset;
  xAxisModel: XAxisModel;
  yAxisModel: YAxisModel;
  series: BaseSeriesModel;
};
