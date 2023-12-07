import type { Query } from "metabase-lib/types";
import type StructuredQuery from "metabase-lib/queries/StructuredQuery";
import type Question from "metabase-lib/Question";
import type Metadata from "metabase-lib/metadata/Metadata";

export type NotebookStepType =
  | "data"
  | "join"
  | "expression"
  | "filter"
  | "summarize"
  | "aggregate"
  | "breakout"
  | "sort"
  | "limit";

export type NotebookStepFn<ReturnType> = (
  legacyQuery: StructuredQuery,
  index: number | undefined | null,
  query: Query,
  stageIndex: number,
  metadata: Metadata,
) => ReturnType;

type RevertFn = (
  query: Query,
  stageIndex: number,
  index?: number,
) => Query | null;

export interface NotebookStep {
  id: string;
  type: NotebookStepType;
  stageIndex: number;
  itemIndex: number | null;
  topLevelQuery: Query;
  query: StructuredQuery;
  valid: boolean;
  active: boolean;
  visible: boolean;
  testID: string;
  revert: RevertFn | null;
  actions: NotebookStepAction[];
  previewQuery: Query | null;
  next: NotebookStep | null;
  previous: NotebookStep | null;
}

export interface NotebookStepAction {
  type: NotebookStepType;
  action: (args: {
    query?: StructuredQuery;
    openStep: (id: string) => void;
  }) => void;
}

export interface NotebookStepUiComponentProps {
  step: NotebookStep;
  topLevelQuery: Query;
  query: StructuredQuery;
  sourceQuestion?: Question;
  color: string;
  isLastOpened: boolean;
  reportTimezone: string;
  readOnly?: boolean;
  updateQuery: (query: Query) => Promise<void>;
}

export type OpenSteps = Record<NotebookStep["id"], boolean>;
