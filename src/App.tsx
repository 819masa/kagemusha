import { useReducer } from "react";
import { BriefingScreen } from "./components/BriefingScreen";
import { HangekiModal } from "./components/HangekiModal";
import { LedgerModal } from "./components/LedgerModal";
import { LogDrawer } from "./components/LogDrawer";
import { PlayScreen } from "./components/PlayScreen";
import { ReportModal } from "./components/ReportModal";
import { SummaryScreen } from "./components/SummaryScreen";
import { TitleScreen } from "./components/TitleScreen";
import { initialState, reducer } from "./game/reducer";

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  let screen = <TitleScreen onStart={() => dispatch({ type: "briefing" })} />;
  switch (state.phase) {
    case "title":
      break;
    case "briefing":
      screen = (
        <BriefingScreen onBack={() => dispatch({ type: "backTitle" })} onStart={() => dispatch({ type: "startDay" })} />
      );
      break;
    case "play":
      screen = <PlayScreen state={state} dispatch={dispatch} />;
      break;
    case "summary":
      screen = <SummaryScreen state={state} dispatch={dispatch} />;
      break;
    default: {
      const exhaustive: never = state.phase;
      throw new Error(`unknown phase: ${String(exhaustive)}`);
    }
  }

  return (
    <>
      {screen}
      {state.ledgerOpen ? <LedgerModal results={state.results} onClose={() => dispatch({ type: "toggleLedger" })} /> : null}
      {state.logOpen ? <LogDrawer entries={state.log} onClose={() => dispatch({ type: "toggleLog" })} /> : null}
      {state.reportOpen ? <ReportModal results={state.results} onClose={() => dispatch({ type: "toggleReport" })} /> : null}
      {state.hangekiOpen ? (
        <HangekiModal
          denial={state.denial}
          intruded={state.intruded}
          onClose={() => dispatch({ type: "closeHangeki" })}
          onRequest={() => dispatch({ type: "hangekiRequest" })}
          onIntrude={() => dispatch({ type: "hangekiIntrude" })}
        />
      ) : null}
    </>
  );
}
