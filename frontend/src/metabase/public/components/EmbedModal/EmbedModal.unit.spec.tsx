import userEvent from "@testing-library/user-event";
import { mockSettings } from "__support__/settings";
import { renderWithProviders, screen } from "__support__/ui";
import { createMockState } from "metabase-types/store/mocks";
import { Button, Group, Text } from "metabase/ui";
import type { EmbedModalStep } from "./EmbedModal";
import { EmbedModal } from "./EmbedModal";

const TEST_APPLICATION_NAME = "Embed Modal Test Application";

const TestEmbedModalInner = ({
  embedType,
  goToNextStep,
  goToPreviousStep,
}: {
  embedType: EmbedModalStep;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}): JSX.Element => {
  return (
    <Group>
      <Button onClick={goToPreviousStep}>Previous</Button>
      <Text>{embedType}</Text>
      <Button onClick={goToNextStep}>Next</Button>
    </Group>
  );
};

const setup = () => {
  const onClose = jest.fn();

  renderWithProviders(
    <EmbedModal isOpen={true} onClose={onClose}>
      {props => <TestEmbedModalInner {...props} />}
    </EmbedModal>,
    {
      storeInitialState: createMockState({
        settings: mockSettings({
          "application-name": TEST_APPLICATION_NAME,
        }),
      }),
    },
  );

  return { onClose };
};

describe("EmbedModal", () => {
  it("should render", () => {
    setup();

    expect(
      screen.getByText("Embed Modal Test Application"),
    ).toBeInTheDocument();
  });

  it("renders the EmbedModal component with application name", () => {
    setup();

    expect(screen.getByText("Embed MyApp")).toBeInTheDocument();
    expect(screen.queryByText("Static embedding")).not.toBeInTheDocument();
  });

  it("renders the EmbedModal component with static embedding", () => {
    setup();

    const chevronLeftIcon = screen.getByTestId("chevron-left-icon");
    userEvent.click(chevronLeftIcon);

    expect(screen.queryByText("Embed MyApp")).not.toBeInTheDocument();
    expect(screen.getByText("Static embedding")).toBeInTheDocument();
  });

  it("calls onClose when the modal is closed", () => {
    const { onClose } = setup();

    const closeButton = screen.getByLabelText("Close");
    userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("calls goToNextStep and changes to 'legalese' when clicked on chevron left icon", () => {
    setup();

    const mockChild = jest.fn();

    const chevronLeftIcon = screen.getByTestId("chevron-left-icon");
    userEvent.click(chevronLeftIcon);

    expect(mockChild).toHaveBeenCalled();
  });

  it("calls goToPreviousStep and changes to null when clicked on chevron left icon twice", () => {
    setup();

    const mockChild = jest.fn();

    const chevronLeftIcon = screen.getByTestId("chevron-left-icon");
    userEvent.click(chevronLeftIcon);
    userEvent.click(chevronLeftIcon);

    expect(mockChild).toHaveBeenCalled();
  });

  it("calls onClose when clicked on close button", () => {
    const { onClose } = setup();

    const closeButton = screen.getByLabelText("Close");
    userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  // Additional test cases...
});
