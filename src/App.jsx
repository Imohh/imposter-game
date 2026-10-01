import { useEffect, useState } from "react";
import { WORDS, MIXED, pickWord } from "./words.js";

const CATEGORIES = [...Object.keys(WORDS), MIXED];
const MIN = 3;
const MAX = 12;
const pad = (n) => String(n).padStart(2, "0");

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [settings, setSettings] = useState({ n: 4, category: "Food", hint: true, timer: true });
  const [game, setGame] = useState(null);

  const nameOf = (i) => game?.names[i]?.trim() || `Player ${i + 1}`;

  const startRound = (names = []) => {
    const { n, category } = settings;
    setGame({
      names,
      i: 0,
      imp: Math.floor(Math.random() * n),
      first: Math.floor(Math.random() * n),
      word: pickWord(category, game?.word),
    });
    setPhase("pass");
  };

  const setName = (i, value) =>
    setGame((g) => {
      const names = [...g.names];
      names[i] = value;
      return { ...g, names };
    });

  const nextPlayer = () => {
    if (game.i < settings.n - 1) {
      setGame((g) => ({ ...g, i: g.i + 1 }));
      setPhase("pass");
    } else setPhase("discuss");
  };

  return (
    <main className="app">
      {phase === "setup" && (
        <Setup settings={settings} onChange={setSettings} onStart={() => startRound([])} />
      )}
      {phase === "pass" && (
        <Pass
          key={game.i}
          n={settings.n}
          index={game.i}
          name={game.names[game.i] ?? ""}
          label={nameOf(game.i)}
          onName={(v) => setName(game.i, v)}
          onReady={() => setPhase("reveal")}
        />
      )}
      {phase === "reveal" && (
        <Reveal
          key={game.i}
          n={settings.n}
          index={game.i}
          label={nameOf(game.i)}
          isImposter={game.i === game.imp}
          word={game.word}
          hint={settings.hint}
          last={game.i === settings.n - 1}
          onNext={nextPlayer}
        />
      )}
      {phase === "discuss" && (
        <Discuss
          seconds={settings.n * 60}
          timer={settings.timer}
          first={nameOf(game.first)}
          onVote={() => setPhase("vote")}
        />
      )}
      {phase === "vote" && (
        <Vote
          n={settings.n}
          nameOf={nameOf}
          onConfirm={(picked) => {
            setGame((g) => ({ ...g, picked }));
            setPhase("result");
          }}
        />
      )}
      {phase === "result" && (
        <Result
          n={settings.n}
          nameOf={nameOf}
          game={game}
          onAgain={() => startRound(game.names)}
          onHome={() => setPhase("setup")}
        />
      )}
    </main>
  );
}

function Setup({ settings, onChange, onStart }) {
  const set = (patch) => onChange({ ...settings, ...patch });
  return (
    <section className="screen">
      <header className="masthead">
        <span className="mono">Party game / 3–12 players</span>
        <h1>
          Imposter<span className="dot">.</span>
        </h1>
        <p className="lede">Everyone gets the same word. Except one of you.</p>
      </header>

      <div className="block">
        <div className="mono label">01 — Players</div>
        <div className="counter">
          <button className="sq" onClick={() => set({ n: Math.max(MIN, settings.n - 1) })} disabled={settings.n <= MIN} aria-label="Fewer players">
            −
          </button>
          <div className="big-num">{pad(settings.n)}</div>
          <button className="sq" onClick={() => set({ n: Math.min(MAX, settings.n + 1) })} disabled={settings.n >= MAX} aria-label="More players">
            +
          </button>
        </div>
      </div>

      <div className="block">
        <div className="mono label">02 — Category</div>
        <div className="cats">
          {CATEGORIES.map((c) => (
            <button key={c} className={"cat" + (settings.category === c ? " on" : "")} onClick={() => set({ category: c })}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="block">
        <div className="mono label">03 — Rules</div>
        <Toggle title="Tell the imposter" desc="Off gives them a blank card instead" on={settings.hint} onClick={() => set({ hint: !settings.hint })} />
        <Toggle title="Discussion timer" desc="One minute per player" on={settings.timer} onClick={() => set({ timer: !settings.timer })} />
      </div>

      <div className="grow" />
      <button className="cta" onClick={onStart}>
        Deal the cards
      </button>
    </section>
  );
}

function Toggle({ title, desc, on, onClick }) {
  return (
    <button className="toggle" role="switch" aria-checked={on} onClick={onClick}>
      <span>
        <b>{title}</b>
        <small>{desc}</small>
      </span>
      <span className={"pill" + (on ? " on" : "")}>{on ? "On" : "Off"}</span>
    </button>
  );
}

function Steps({ n, index }) {
  return (
    <div className="steps" aria-label={`Player ${index + 1} of ${n}`}>
      {Array.from({ length: n }, (_, k) => (
        <i key={k} className={k < index ? "done" : k === index ? "cur" : ""} />
      ))}
    </div>
  );
}

function Pass({ n, index, name, label, onName, onReady }) {
  return (
    <section className="screen">
      <Steps n={n} index={index} />
      <div className="mono label">
        Card {pad(index + 1)} / {pad(n)}
      </div>
      <div className="pass">
        <h2>
          Pass the phone to <em>{label}</em>
        </h2>
        <p className="lede">Make sure nobody else can see the screen.</p>
        <input
          className="field"
          value={name}
          maxLength={14}
          placeholder="Your name (optional)"
          onChange={(e) => onName(e.target.value)}
        />
      </div>
      <button className="cta" onClick={onReady}>
        I'm ready
      </button>
    </section>
  );
}

function Reveal({ n, index, label, isImposter, word, hint, last, onNext }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);

  const toggle = () => {
    if (open) setSeen(true);
    setOpen(!open);
  };

  return (
    <section className="screen">
      <Steps n={n} index={index} />
      <div className="mono label">{label}</div>
      <div className="stage">
        <button className={"card" + (open ? " open" : "")} onClick={toggle} aria-label={open ? "Hide card" : "Reveal card"}>
          <span className="face front">
            <span className="mono">Tap to reveal</span>
            <span className="mark">?</span>
          </span>
          <span className={"face back " + (isImposter ? "imp" : "crew")}>
            {isImposter ? (
              hint ? (
                <>
                  <span className="mono">Your role</span>
                  <span className="word">Imposter</span>
                  <span className="note">Blend in. Don't get caught.</span>
                </>
              ) : (
                <>
                  <span className="mono">Your word</span>
                  <span className="word blank">———</span>
                  <span className="note">You don't have one. Bluff.</span>
                </>
              )
            ) : (
              <>
                <span className="mono">The word is</span>
                <span className="word">{word}</span>
                <span className="note">Don't say it out loud.</span>
              </>
            )}
          </span>
        </button>
        <p className="lede center">Tap the card again to hide it before you pass the phone on.</p>
      </div>
      <button className="cta" disabled={!seen} onClick={onNext}>
        {last ? "Start discussion" : "Next player"}
      </button>
    </section>
  );
}

function Discuss({ seconds, timer, first, onVote }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (timer && left === 0 && navigator.vibrate) navigator.vibrate(300);
  }, [timer, left]);

  return (
    <section className="screen">
      <div className="mono label">Discussion</div>
      <div className="pass">
        {timer && (
          <div className={"clock" + (left <= 15 ? " low" : "")}>
            {pad(Math.floor(left / 60))}:{pad(left % 60)}
          </div>
        )}
        <h2>
          <em>{first}</em> speaks first
        </h2>
        <p className="lede">Describe the word without saying it. Ask questions. Work out who doesn't belong.</p>
        {timer && left === 0 && <p className="mono alert">Time's up</p>}
      </div>
      <button className="cta" onClick={onVote}>
        Go to vote
      </button>
    </section>
  );
}

function Vote({ n, nameOf, onConfirm }) {
  const [picked, setPicked] = useState(null);
  return (
    <section className="screen">
      <div className="mono label">The vote</div>
      <h2 className="title">Who is the imposter?</h2>
      <p className="lede">Agree as a group, then select one.</p>
      <ul className="list">
        {Array.from({ length: n }, (_, k) => (
          <li key={k}>
            <button className={"row" + (picked === k ? " sel" : "")} onClick={() => setPicked(k)}>
              <span className="idx mono">{pad(k + 1)}</span>
              <span className="nm">{nameOf(k)}</span>
              <span className="check">{picked === k ? "Selected" : ""}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="grow" />
      <button className="cta" disabled={picked === null} onClick={() => onConfirm(picked)}>
        Reveal
      </button>
    </section>
  );
}

function Result({ n, nameOf, game, onAgain, onHome }) {
  const caught = game.picked === game.imp;
  return (
    <section className="screen">
      <div className="mono label">Result</div>
      <h2 className={"verdict " + (caught ? "win" : "lose")}>{caught ? "Imposter caught." : "The imposter got away."}</h2>
      <p className="lede">
        <b>{nameOf(game.imp)}</b> was the imposter. The word was <b>{game.word}</b>.
      </p>
      <ul className="list">
        {Array.from({ length: n }, (_, k) => (
          <li key={k}>
            <div className={"row static" + (k === game.imp ? " imp" : "")}>
              <span className="idx mono">{pad(k + 1)}</span>
              <span className="nm">{nameOf(k)}</span>
              <span className="check">{k === game.imp ? "Imposter" : ""}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="grow" />
      <button className="cta" onClick={onAgain}>
        Play again
      </button>
      <button className="cta ghost" onClick={onHome}>
        Change settings
      </button>
    </section>
  );
}
