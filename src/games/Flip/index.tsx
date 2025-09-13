import { BannerWithMessages, FlipBanner } from "./FlipBanner";
// src/games/Flip/index.tsx
import { GambaUi, useCurrentToken, useSound } from "gamba-react-ui-v2";
import { Suspense, useState, useEffect } from "react";

import { Canvas } from "@react-three/fiber";
import { Coin } from "./Coin";
import { Effect } from "./Effect";
import GambaPlayButton from "@/components/GambaPlayButton";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { toast } from "sonner";
import { useGamba } from "gamba-react-v2";

const SIDES = {
  heads: [2, 0],
  tails: [0, 2],
};

const SOUND_COIN = "/games/flip/coin.mp3";
const SOUND_WIN = "/games/flip/win.mp3";
const SOUND_LOSE = "/games/flip/lose.mp3";

type Side = keyof typeof SIDES;

interface GambaResult {
  payout: number;
  resultIndex: number;
}

function Flip() {
  const game = GambaUi.useGame();
  const token = useCurrentToken();
  const gamba = useGamba();
  const [flipping, setFlipping] = useState(false);
  const [win, setWin] = useState<boolean | undefined>(undefined);
  const [resultIndex, setResultIndex] = useState(0);
  const [result, setResult] = useState<GambaResult | null>(null);
  const [side, setSide] = useState<Side>("heads");

  const WAGER_OPTIONS = [1, 5, 10, 50, 100];
  const [wager, setWager] = useState(WAGER_OPTIONS[0]);

  const sounds = useSound({
    coin: SOUND_COIN,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  });

  const [messages, setMessages] = useState(["Flip to win!"]);

  useEffect(() => {
    if (flipping) {
      setMessages(["Flipping!", "Good luck!"]);
    } else if (win === true) {
      setMessages(["You win!", "Congrats!"]);
    } else if (win === false) {
      setMessages(["You lose!"]);
    } else {
      setMessages(["Flip to win!"]);
    }
  }, [flipping, win]);

  const play = async () => {
    try {
      setWin(undefined);
      setFlipping(true);
      setResult([]);
      sounds.play("coin", { playbackRate: 0.5 });

      await game.play({
        bet: SIDES[side],
        wager,
        metadata: [side],
      });

      sounds.play("coin");
      const result = await gamba.result();
      const win = result.payout > 0;
      setResultIndex(result.resultIndex);
      setResult(result);
      setWin(win ? true : false);

      if (win) {
        sounds.play("win");
      } else {
        sounds.play("lose");
      }
    } catch (err: any) {
      setMessages([`An error occurred: ${err.message}`]);
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setFlipping(false);
    }
  };

  return (
    <>
      <GambaUi.Portal target="screen">
        <Canvas
          linear
          flat
          orthographic
          camera={{
            zoom: 80,
            position: [0, 0, 100],
          }}
        >
          <Suspense fallback={null}>
            <primitive object={new THREE.AmbientLight(0xffffff, 1)} />
            <BannerWithMessages messages={messages} />

            <Coin
              key={"main-coin"}
              result={resultIndex}
              flipping={flipping}
              scale={1}
              rotation={[-0.6, 0, 0]}
            />

            <FlipBanner position={[0, -2.5, 0]} />
            <Coin
              key={"side-coin"}
              result={side === "heads" ? 0 : 1}
              flipping={false}
              scale={0.8}
              position={[-0.4, -2.5, 0]}
              onClick={() => setSide(side === "heads" ? "tails" : "heads")}
            />
            <Text
              onClick={() => setSide(side === "heads" ? "tails" : "heads")}
              position={[0.4, -2.5, 0]}
              fontSize={0.25}
            >
              {side === "heads" ? "Heads" : "Tails"}
            </Text>
          </Suspense>
          <Effect color="white" />

          {flipping && <Effect color="white" />}
          {win && <Effect color="#42ff78" />}
          <primitive object={new THREE.AmbientLight(0xffffff, 3)} />
          <primitive object={new THREE.DirectionalLight(0xffffff, 1)} position={[0, 1, 1]} castShadow color="#CCCCCC" />
          <primitive object={new THREE.HemisphereLight(0xffadad, 0x6666fe, 0.5)} position={[0, 1, 0]} />
        </Canvas>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />
        <GambaPlayButton onClick={play} text="Flip" />
      </GambaUi.Portal>
    </>
  );
}

export default Flip;