import React from "react";
import { DependencyList, useEffect, useMemo, useRef, useState } from "react";
// src/games/Plinko/index.tsx
import { GambaUi, useSound, useWagerInput } from "gamba-react-ui-v2";
import {
  PEG_RADIUS,
  PLINKO_RAIUS,
  Plinko as PlinkoGame,
  PlinkoProps,
  barrierHeight,
  barrierWidth,
  bucketHeight,
} from "./game";

import GambaPlayButton from "@/components/GambaPlayButton";
import { toast } from "sonner";
import { useGamba } from "gamba-react-v2";

function usePlinko(props: PlinkoProps, deps: DependencyList) {
  const [plinko, set] = useState<PlinkoGame>(null!);

  useEffect(() => {
    const p = new PlinkoGame(props);
    set(p);
    return () => p.cleanup();
  }, deps);

  return plinko;
}

const BUMP = "/games/plinko/bump.mp3";
const WIN = "/games/plinko/win.mp3";
const FALL = "/games/plinko/fall.mp3";

const DEGEN_BET = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 10, 10, 10, 15,
];
const BET = [
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
  0.5, 0.5, 0.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 3, 3, 3, 3,
  3, 3, 3, 6,
];

export default function Plinko() {
  const game = GambaUi.useGame();
  const gamba = useGamba();
  const [wager, setWager] = useWagerInput();
  const [debug, setDebug] = useState(false);
  const [degen, setDegen] = useState(false);
  const sounds = useSound({
    bump: BUMP,
    win: WIN,
    fall: FALL,
  });

  const pegAnimations = useRef<Record<number, number>>({});
  const bucketAnimations = useRef<Record<number, number>>({});

  const bet = degen ? DEGEN_BET : BET;
  const rows = degen ? 12 : 14;

  const multipliers = useMemo(() => Array.from(new Set(bet)), [bet]);

  const plinko = usePlinko(
    {
      rows,
      multipliers,
      onContact(contact) {
        if (contact.peg && contact.plinko) {
          pegAnimations.current[contact.peg.plugin.pegIndex] = 1;
          sounds.play("bump", { playbackRate: 1 + Math.random() * 0.05 });
        }
        if (contact.barrier && contact.plinko) {
          sounds.play("bump", { playbackRate: 0.5 + Math.random() * 0.05 });
        }
        if (contact.bucket && contact.plinko) {
          bucketAnimations.current[contact.bucket.plugin.bucketIndex] = 1;
          sounds.play(
            contact.bucket.plugin.bucketMultiplier >= 1 ? "win" : "fall"
          );
        }
      },
    },
    [rows, multipliers]
  );

  const play = async () => {
    try {
      plinko.reset();

      await game.play({ wager, bet });

      const result = await gamba.result();

      plinko.run(result.multiplier);
    } catch (err: any) {
      toast.error(`An error occurred: ${err.message}`);
      plinko.reset();
    }
  };

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Canvas
          render={({ ctx, size }, clock) => {
            if (!plinko) return;

            const bodies = plinko.getBodies();

            const xx = size.width / plinko.width;
            const yy = size.height / plinko.height;
            const s = Math.min(xx, yy);

            ctx.clearRect(0, 0, size.width, size.height);
            ctx.fillStyle = "#1A1B28";
            ctx.fillRect(0, 0, size.width, size.height);
            ctx.save();
            ctx.translate(
              size.width / 2 - (plinko.width / 2) * s,
              size.height / 2 - (plinko.height / 2) * s
            );
            ctx.scale(s, s);
            if (debug) {
              ctx.beginPath();
              bodies.forEach(({ vertices }, i) => {
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                  ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
              });
              ctx.lineWidth = 1;
              ctx.strokeStyle = "#fff";
              ctx.stroke();
            } else {
              bodies.forEach((body, i) => {
                const { label, position } = body;
                if (label === "Peg") {
                  ctx.save();
                  ctx.translate(position.x, position.y);

                  const animation =
                    pegAnimations.current[body.plugin.pegIndex] ?? 0;

                  if (pegAnimations.current[body.plugin.pegIndex]) {
                    pegAnimations.current[body.plugin.pegIndex] *= 0.9;
                  }
                  ctx.scale(1 + animation * 0.4, 1 + animation * 0.4);
                  const pegHue =
                    (position.y + position.x + Date.now() * 0.05) % 360;
                  ctx.fillStyle =
                    "hsla(" +
                    pegHue +
                    ", 75%, 60%, " +
                    (1 + animation * 2) * 0.2 +
                    ")";
                  ctx.beginPath();
                  ctx.arc(0, 0, PEG_RADIUS + 4, 0, Math.PI * 2);
                  ctx.fill();

                  const light = 75 + animation * 25;
                  ctx.fillStyle =
                    "hsla(" + pegHue + ", 85%, " + light + "%, 1)";
                  ctx.beginPath();
                  ctx.arc(0, 0, PEG_RADIUS, 0, Math.PI * 2);
                  ctx.fill();

                  ctx.restore();
                }
                if (label === "Plinko") {
                  ctx.save();
                  ctx.translate(position.x, position.y);

                  ctx.fillStyle =
                    "hsla(" + ((i * 420) % 360) + ", 75%, 90%, .2)";
                  ctx.beginPath();
                  ctx.arc(0, 0, PLINKO_RAIUS * 1.5, 0, Math.PI * 2);
                  ctx.fill();

                  ctx.fillStyle =
                    "hsla(" + ((i * 420) % 360) + ", 75%, 75%, 1)";
                  ctx.beginPath();
                  ctx.arc(0, 0, PLINKO_RAIUS, 0, Math.PI * 2);
                  ctx.fill();

                  ctx.restore();
                }
                if (label === "Bucket") {
                  const animation =
                    bucketAnimations.current[body.plugin.bucketIndex] ?? 0;

                  if (bucketAnimations.current[body.plugin.bucketIndex]) {
                    bucketAnimations.current[body.plugin.bucketIndex] *= 0.9;
                  }

                  ctx.save();
                  ctx.translate(position.x, position.y);
                  const bucketHue =
                    25 +
                    (multipliers.indexOf(body.plugin.bucketMultiplier) /
                      multipliers.length) *
                      125;
                  const bucketAlpha = 0.05 + animation;

                  ctx.save();
                  ctx.translate(0, bucketHeight / 2);
                  ctx.scale(1, 1 + animation * 2);
                  ctx.fillStyle =
                    "hsla(" + bucketHue + ", 75%, 75%, " + bucketAlpha + ")";
                  ctx.fillRect(-25, -bucketHeight, 50, bucketHeight);
                  ctx.restore();

                  ctx.font = "20px Arial";
                  ctx.textAlign = "center";
                  ctx.fillStyle = "hsla(" + bucketHue + ", 50%, 75%, 1)";
                  ctx.lineWidth = 5;
                  ctx.lineJoin = "miter";
                  ctx.miterLimit = 2;
                  const brightness = 75 + animation * 25;
                  ctx.fillStyle =
                    "hsla(" + bucketHue + ", 75%, " + brightness + "%, 1)";
                  ctx.strokeText("x" + body.plugin.bucketMultiplier, 0, 0);
                  ctx.stroke();
                  ctx.fillText("x" + body.plugin.bucketMultiplier, 0, 0);
                  ctx.fill();

                  ctx.restore();
                }
                if (label === "Barrier") {
                  ctx.save();
                  ctx.translate(position.x, position.y);

                  ctx.fillStyle = "#cccccc22";
                  ctx.fillRect(
                    -barrierWidth / 2,
                    -barrierHeight / 2,
                    barrierWidth,
                    barrierHeight
                  );

                  ctx.restore();
                }
              });
            }
            ctx.restore();
          }}
        />
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />
        <div>Degen:</div>
        <GambaUi.Switch
          disabled={gamba.isPlaying}
          checked={degen}
          onChange={setDegen}
        />

        <GambaPlayButton onClick={play} text="Play" />
      </GambaUi.Portal>
    </>
  );
}
