import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Link } from "react-router-dom";
import Header from "../components/Header";

const API_URL = "https://adaptive-python.onrender.com";

/* =========================================================
   MISSIONS
========================================================= */

const MISSIONS = [
  {
    title: "Mission 1",
    question: 'แสดงคำว่า "Hello Python"',
    answer: `print("Hello Python")`,
    hint: 'ใช้ print("Hello Python")',
  },
  {
    title: "Mission 2",
    question: 'สร้างตัวแปร name ให้มีค่า "Python"',
    answer: `name = "Python"`,
    hint: 'name = "Python"',
  },
  {
    title: "Mission 3",
    question: "สร้าง score = 10 และแสดงค่า score",
    answer: `score = 10
print(score)`,
    hint: "สร้างตัวแปร score แล้วใช้ print(score)",
  },
  {
    title: "Mission 4",
    question: 'ถ้า score >= 50 ให้แสดง "Pass"',
    answer: `score = 50
if score >= 50:
    print("Pass")`,
    hint: "ใช้ if score >= 50:",
  },
  {
    title: "Mission 5",
    question: 'สร้างฟังก์ชัน goal() และแสดง "GOAL!"',
    answer: `def goal():
    print("GOAL!")

goal()`,
    hint: "สร้าง function แล้วเรียก goal()",
  },
];

/* =========================================================
   FIELD
========================================================= */

function Field() {
  const lines = useMemo(() => {
    const result = [];

    for (let x = -6; x <= 6; x += 1) {
      result.push(
        <mesh
          key={`x-${x}`}
          position={[x, 0.015, -2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.025, 20]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
      );
    }

    return result;
  }, []);

  return (
    <group>
      {/* Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 30]} />
        <meshStandardMaterial color="#197a3b" roughness={0.9} />
      </mesh>

      {/* Field stripes */}
      {[-7, -3.5, 0, 3.5, 7].map((z) => (
        <mesh
          key={z}
          position={[0, 0.01, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[20, 3.5]} />
          <meshStandardMaterial
            color={z % 7 === 0 ? "#19713a" : "#1d8242"}
          />
        </mesh>
      ))}

      {/* Center line */}
      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[20, 0.04]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Penalty box */}
      <group position={[0, 0.04, -8]}>
        <mesh position={[0, 0, 2]}>
          <boxGeometry args={[8, 0.04, 0.04]} />
          <meshBasicMaterial color="white" />
        </mesh>

        <mesh position={[-4, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 4]} />
          <meshBasicMaterial color="white" />
        </mesh>

        <mesh position={[4, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 4]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>

      {/* Field lines */}
      {lines}
    </group>
  );
}

/* =========================================================
   GOAL
========================================================= */

function Goal() {
  return (
    <group position={[0, 0, -12]}>
      {/* Left post */}
      <mesh position={[-3.6, 1.7, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 3.4, 16]} />
        <meshStandardMaterial
          color="white"
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Right post */}
      <mesh position={[3.6, 1.7, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 3.4, 16]} />
        <meshStandardMaterial
          color="white"
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Crossbar */}
      <mesh
        position={[0, 3.4, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.12, 0.12, 7.2, 16]} />
        <meshStandardMaterial
          color="white"
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Net */}
      <mesh position={[0, 1.7, 0.8]}>
        <boxGeometry args={[7.1, 3.3, 1.6]} />
        <meshStandardMaterial
          color="#dbeafe"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Goal floor */}
      <mesh position={[0, 0.03, 0.4]}>
        <boxGeometry args={[7.2, 0.05, 1.8]} />
        <meshStandardMaterial
          color="#14532d"
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PLAYER
========================================================= */

function Player({ position, running, shooting }) {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;

    if (running) {
      group.current.rotation.z =
        Math.sin(time * 12) * 0.04;
    }

    if (shooting) {
      group.current.rotation.x = -0.25;
    } else {
      group.current.rotation.x = 0;
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Shadow */}
      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.65, 24]} />
        <meshBasicMaterial
          color="black"
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Body */}
      <mesh position={[0, 1.15, 0]}>
        <capsuleGeometry args={[0.42, 0.9, 8, 16]} />
        <meshStandardMaterial
          color="#2563eb"
          roughness={0.7}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshStandardMaterial
          color="#f1b18b"
          roughness={0.8}
        />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 2.35, -0.02]}>
        <sphereGeometry args={[0.37, 20, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.18, 0.45, 0]}>
        <capsuleGeometry args={[0.12, 0.65, 6, 10]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.18, 0.45, 0]}>
        <capsuleGeometry args={[0.12, 0.65, 6, 10]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.18, 0.08, -0.1]}>
        <boxGeometry args={[0.3, 0.14, 0.55]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0.18, 0.08, -0.1]}>
        <boxGeometry args={[0.3, 0.14, 0.55]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Shirt number */}
      <Text
        position={[0, 1.2, -0.43]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.28}
        color="white"
        anchorX="center"
      >
        10
      </Text>
    </group>
  );
}

/* =========================================================
   GOALKEEPER
========================================================= */

function Goalkeeper({ target, active }) {
  const group = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;

    if (active) {
      const targetX = target;

      group.current.position.x = THREE.MathUtils.damp(
        group.current.position.x,
        targetX,
        4,
        delta
      );

      group.current.rotation.z =
        THREE.MathUtils.damp(
          group.current.rotation.z,
          targetX > 0 ? -0.5 : 0.5,
          4,
          delta
        );
    } else {
      group.current.position.x = THREE.MathUtils.damp(
        group.current.position.x,
        0,
        2,
        delta
      );

      group.current.rotation.z = THREE.MathUtils.damp(
        group.current.rotation.z,
        0,
        3,
        delta
      );
    }
  });

  return (
    <group
      ref={group}
      position={[0, 0, -11.2]}
    >
      {/* Body */}
      <mesh position={[0, 1.15, 0]}>
        <capsuleGeometry args={[0.45, 0.9, 8, 16]} />
        <meshStandardMaterial
          color="#dc2626"
          roughness={0.7}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial color="#f1b18b" />
      </mesh>

      {/* Arms */}
      <mesh
        position={[-0.65, 1.35, 0]}
        rotation={[0, 0, -0.8]}
      >
        <capsuleGeometry args={[0.12, 0.65, 6, 10]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      <mesh
        position={[0.65, 1.35, 0]}
        rotation={[0, 0, 0.8]}
      >
        <capsuleGeometry args={[0.12, 0.65, 6, 10]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Gloves */}
      <mesh position={[-0.95, 1.55, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>

      <mesh position={[0.95, 1.55, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

/* =========================================================
   BALL
========================================================= */

function Ball({ ball }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.position.lerp(
      new THREE.Vector3(
        ball.position.x,
        ball.position.y,
        ball.position.z
      ),
      1 - Math.pow(0.001, delta)
    );

    ref.current.rotation.x += delta * 8;
    ref.current.rotation.z += delta * 5;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.28, 24, 24]} />
      <meshStandardMaterial
        color="white"
        roughness={0.35}
      />
    </mesh>
  );
}

/* =========================================================
   AIM MARKER
========================================================= */

function AimMarker({ position, selected }) {
  return (
    <group position={position}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            selected ? 0.35 : 0.22,
            selected ? 0.43 : 0.28,
            32,
          ]}
        />
        <meshBasicMaterial
          color={selected ? "#22c55e" : "#facc15"}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial
          color={selected ? "#22c55e" : "#facc15"}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   STADIUM
========================================================= */

function Stadium() {
  return (
    <group>
      {/* Back stands */}
      <mesh position={[0, 3, -15]}>
        <boxGeometry args={[30, 6, 2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Left stand */}
      <mesh position={[-14, 3, -3]}>
        <boxGeometry args={[2, 6, 24]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Right stand */}
      <mesh position={[14, 3, -3]}>
        <boxGeometry args={[2, 6, 24]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Stadium lights */}
      {[-10, 10].map((x) => (
        <group key={x} position={[x, 7, -13]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 8, 12]} />
            <meshStandardMaterial color="#111827" />
          </mesh>

          <mesh position={[0, 4, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* =========================================================
   CAMERA
========================================================= */

function CameraFollow({ playerPosition }) {
  const camera = useRef();

  useFrame((_, delta) => {
    if (!camera.current) return;

    const desired = new THREE.Vector3(
      playerPosition[0],
      6.5,
      playerPosition[1] + 9
    );

    camera.current.position.lerp(
      desired,
      1 - Math.pow(0.01, delta)
    );

    const lookAt = new THREE.Vector3(
      playerPosition[0],
      1,
      playerPosition[1] - 5
    );

    camera.current.lookAt(lookAt);
  });

  return (
    <PerspectiveCamera
      ref={camera}
      makeDefault
      position={[0, 6.5, 9]}
      fov={55}
    />
  );
}

/* =========================================================
   GAME SCENE
========================================================= */

function GameScene({
  playerPosition,
  running,
  shooting,
  ball,
  keeperTarget,
  keeperActive,
  aimPosition,
  onAimClick,
}) {
  return (
    <>
      <CameraFollow playerPosition={playerPosition} />

      <ambientLight intensity={1.2} />

      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
        castShadow
      />

      <hemisphereLight
        intensity={0.7}
        groundColor="#14532d"
        skyColor="#93c5fd"
      />

      <Stadium />

      <Field />

      <Goal />

      <Player
        position={[
          playerPosition[0],
          0,
          playerPosition[1],
        ]}
        running={running}
        shooting={shooting}
      />

      <Goalkeeper
        target={keeperTarget}
        active={keeperActive}
      />

      <Ball ball={ball} />

      {/* Aim positions */}
      {[
        [-2.5, 2.8, -11.4],
        [0, 2.6, -11.4],
        [2.5, 2.8, -11.4],
      ].map((pos, index) => (
        <group
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            onAimClick(pos[0]);
          }}
        >
          <AimMarker
            position={pos}
            selected={aimPosition === pos[0]}
          />
        </group>
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function FootballMissionPage() {
  const [missionIndex, setMissionIndex] = useState(0);

  const [code, setCode] = useState(
    MISSIONS[0].answer
  );

  const [output, setOutput] = useState("");

  const [message, setMessage] = useState(
    "ตอบ Mission ให้ถูกต้องก่อน จึงจะสามารถยิงได้"
  );

  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);

  const [codeCorrect, setCodeCorrect] =
    useState(false);

  const [running, setRunning] = useState(false);

  const [shooting, setShooting] = useState(false);

  const [keeperActive, setKeeperActive] =
    useState(false);

  const [goalMessage, setGoalMessage] =
    useState("");

  const [aimPosition, setAimPosition] =
    useState(0);

  const [playerPosition, setPlayerPosition] =
    useState([0, 6]);

  const keys = useRef({});

  const ball = useRef({
    position: {
      x: 0,
      y: 0.35,
      z: 7.2,
    },
    velocity: {
      x: 0,
      y: 0,
      z: 0,
    },
    active: false,
  });

  const mission = MISSIONS[missionIndex];

  /* =====================================================
     KEYBOARD
  ===================================================== */

  useEffect(() => {
    const handleDown = (e) => {
      const key = e.key.toLowerCase();

      keys.current[key] = true;

      if (e.code === "Space") {
        e.preventDefault();
        shoot();
      }
    };

    const handleUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener(
      "keydown",
      handleDown
    );

    window.addEventListener(
      "keyup",
      handleUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleDown
      );

      window.removeEventListener(
        "keyup",
        handleUp
      );
    };
  }, [codeCorrect, shooting, aimPosition]);

  /* =====================================================
     PLAYER MOVEMENT
  ===================================================== */

  useEffect(() => {
    let frame;

    const update = () => {
      setPlayerPosition((current) => {
        let x = current[0];
        let z = current[1];

        let dx = 0;
        let dz = 0;

        if (
          keys.current.w ||
          keys.current.arrowup
        ) {
          dz -= 1;
        }

        if (
          keys.current.s ||
          keys.current.arrowdown
        ) {
          dz += 1;
        }

        if (
          keys.current.a ||
          keys.current.arrowleft
        ) {
          dx -= 1;
        }

        if (
          keys.current.d ||
          keys.current.arrowright
        ) {
          dx += 1;
        }

        if (dx === 0 && dz === 0) {
          return current;
        }

        const length = Math.sqrt(
          dx * dx + dz * dz
        );

        dx /= length;
        dz /= length;

        const speed = keys.current.shift
          ? 0.16
          : 0.09;

        x += dx * speed;
        z += dz * speed;

        x = THREE.MathUtils.clamp(x, -7, 7);
        z = THREE.MathUtils.clamp(z, -1, 8);

        return [x, z];
      });

      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  /* =====================================================
     BALL PHYSICS
  ===================================================== */

  useEffect(() => {
    let frame;
    let last = performance.now();

    const updateBall = (time) => {
      const delta = Math.min(
        (time - last) / 1000,
        0.05
      );

      last = time;

      if (ball.current.active) {
        const b = ball.current;

        b.velocity.y -= 4.5 * delta;

        b.position.x +=
          b.velocity.x * delta;

        b.position.y +=
          b.velocity.y * delta;

        b.position.z +=
          b.velocity.z * delta;

        // Ground bounce
        if (b.position.y < 0.28) {
          b.position.y = 0.28;

          b.velocity.y *= -0.28;
        }

        // Goal line
        if (b.position.z <= -11.2) {
          resolveShot();
        }
      }

      frame =
        requestAnimationFrame(updateBall);
    };

    frame =
      requestAnimationFrame(updateBall);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [keeperActive]);

  /* =====================================================
     CHECK PYTHON
  ===================================================== */

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    setMessage("กำลังตรวจสอบ Python...");

    try {
      const response = await fetch(
        `${API_URL}/run-python`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Python Server Error"
        );
      }

      setOutput(data.output || "");

      const normalize = (text) =>
        text
          .replace(/\s/g, "")
          .replace(/'/g, '"')
          .toLowerCase();

      const userCode = normalize(code);
      const answer = normalize(
        mission.answer
      );

      /*
        ต้องตรงกับ Mission
      */

      const correct =
        userCode === answer ||
        userCode.includes(answer);

      if (correct) {
        setCodeCorrect(true);

        setXp((value) => value + 50);

        setMessage(
          "✅ ถูกต้อง! ปลดล็อกการยิงแล้ว ⚽"
        );
      } else {
        setCodeCorrect(false);

        setMessage(
          "❌ Python ทำงานได้ แต่คำตอบไม่ตรง Mission — ยิงไม่ได้"
        );
      }
    } catch (error) {
      setCodeCorrect(false);

      setOutput(error.message);

      setMessage(
        "❌ ไม่สามารถเชื่อมต่อ Python Server ได้"
      );
    } finally {
      setRunning(false);
    }
  };

  /* =====================================================
     AIM
  ===================================================== */

  const selectAim = (x) => {
    if (shooting) return;

    setAimPosition(x);

    setMessage(
      `🎯 เล็งไปที่ ${
        x < 0
          ? "มุมซ้าย"
          : x > 0
          ? "มุมขวา"
          : "ตรงกลาง"
      }`
    );
  };

  /* =====================================================
     SHOOT
  ===================================================== */

  const shoot = () => {
    if (!codeCorrect) {
      setMessage(
        "🔒 ต้องตอบ Python ให้ถูกก่อนจึงจะยิงได้"
      );

      return;
    }

    if (shooting) return;

    const startX = playerPosition[0];

    /*
      ยิงไปยังตำแหน่ง Aim
    */

    const targetX = aimPosition;

    const startZ = playerPosition[1] + 0.8;

    const targetZ = -11.4;

    const dx = targetX - startX;
    const dz = targetZ - startZ;

    const distance = Math.sqrt(
      dx * dx + dz * dz
    );

    const speed = 18;

    ball.current.position = {
      x: startX,
      y: 0.45,
      z: startZ,
    };

    ball.current.velocity = {
      x: (dx / distance) * speed,
      y: 5.5,
      z: (dz / distance) * speed,
    };

    ball.current.active = true;

    setShooting(true);
    setKeeperActive(true);
    setGoalMessage("");

    /*
      Keeper จะเลือกพุ่ง
      มีโอกาสเซฟประมาณ 35%
    */

    const keeperSave =
      Math.random() < 0.35;

    if (keeperSave) {
      setTimeout(() => {
        setMessage(
          "🧤 ผู้รักษาประตูพุ่งเซฟ!"
        );
      }, 350);
    } else {
      setTimeout(() => {
        setMessage(
          "⚡ บอลกำลังพุ่งเข้าหาประตู..."
        );
      }, 100);
    }
  };

  /* =====================================================
     RESOLVE SHOT
  ===================================================== */

  const resolveShot = () => {
    if (!ball.current.active) return;

    ball.current.active = false;

    /*
      ตรวจตำแหน่ง x
    */

    const x = ball.current.position.x;

    const inside =
      Math.abs(x) <= 3.45;

    /*
      จำลอง Keeper
    */

    const keeperSave =
      Math.random() < 0.35;

    if (!inside) {
      setMessage(
        "❌ ยิงออกนอกกรอบ!"
      );

      setGoalMessage("MISS");

      resetBall();

      return;
    }

    if (keeperSave) {
      setMessage(
        "🧤 SAVE! ผู้รักษาประตูเซฟได้!"
      );

      setGoalMessage("SAVE");

      resetBall();

      return;
    }

    /*
      GOAL
    */

    setScore((value) => value + 1);

    setXp((value) => value + 100);

    setMessage(
      "⚽ GOAL!!! ยิงเข้าประตูสำเร็จ!"
    );

    setGoalMessage("GOAL!");

    resetBall();
  };

  /* =====================================================
     RESET BALL
  ===================================================== */

  const resetBall = () => {
    setTimeout(() => {
      ball.current.position = {
        x: playerPosition[0],
        y: 0.35,
        z: playerPosition[1] + 0.8,
      };

      ball.current.velocity = {
        x: 0,
        y: 0,
        z: 0,
      };

      ball.current.active = false;

      setShooting(false);
      setKeeperActive(false);

      setTimeout(() => {
        setGoalMessage("");
      }, 1200);
    }, 500);
  };

  /* =====================================================
     NEXT MISSION
  ===================================================== */

  const nextMission = () => {
    if (
      missionIndex >=
      MISSIONS.length - 1
    ) {
      setMessage(
        "🎉 คุณผ่านทุก Mission แล้ว!"
      );

      return;
    }

    const next =
      missionIndex + 1;

    setMissionIndex(next);

    setCode(
      MISSIONS[next].answer
    );

    setOutput("");

    setCodeCorrect(false);

    setGoalMessage("");

    setMessage(
      "🔒 Mission ใหม่ — ตอบ Python ให้ถูกก่อนยิง"
    );
  };

  /* =====================================================
     RESET CODE
  ===================================================== */

  const resetCode = () => {
    setCode(mission.answer);
    setOutput("");
    setCodeCorrect(false);

    setMessage(
      "รีเซ็ตโค้ดแล้ว ตรวจคำตอบอีกครั้ง"
    );
  };

  const isRunning =
    keys.current.w ||
    keys.current.a ||
    keys.current.s ||
    keys.current.d ||
    keys.current.arrowup ||
    keys.current.arrowdown ||
    keys.current.arrowleft ||
    keys.current.arrowright;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* =================================================
            TITLE
        ================================================= */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-green-400">
              FOOTBALL CODING MISSION
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              ⚽ 3D Python Football Arena
            </h1>

            <p className="mt-2 text-slate-400">
              เขียน Python → ตอบให้ถูก → เล็ง → ยิงประตู
            </p>
          </div>

          <Link
            to="/"
            className="rounded-xl border border-slate-700 px-4 py-2 font-semibold transition hover:bg-slate-800"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>

        {/* =================================================
            HUD
        ================================================= */}

        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">
              SCORE
            </p>

            <p className="text-2xl font-black text-green-400">
              ⚽ {score}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">
              XP
            </p>

            <p className="text-2xl font-black text-yellow-400">
              ⭐ {xp}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">
              MISSION
            </p>

            <p className="text-2xl font-black">
              {missionIndex + 1}/
              {MISSIONS.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">
              SHOOT
            </p>

            <p
              className={`text-xl font-black ${
                codeCorrect
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {codeCorrect
                ? "🔓 UNLOCKED"
                : "🔒 LOCKED"}
            </p>
          </div>
        </div>

        {/* =================================================
            3D GAME
        ================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-black shadow-2xl">
          <div className="h-[600px] w-full">
            <Canvas shadows>
              <color
                attach="background"
                args={["#87ceeb"]}
              />

              <GameScene
                playerPosition={playerPosition}
                running={isRunning}
                shooting={shooting}
                ball={ball.current}
                keeperTarget={
                  aimPosition
                }
                keeperActive={
                  keeperActive
                }
                aimPosition={
                  aimPosition
                }
                onAimClick={
                  selectAim
                }
              />
            </Canvas>
          </div>

          {/* =================================================
              GAME HUD
          ================================================= */}

          <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur">
            <p className="font-bold text-green-400">
              🎮 CONTROLS
            </p>

            <div className="mt-2 space-y-1 text-xs text-slate-200">
              <p>W A S D / Arrow — เดิน</p>
              <p>SHIFT — วิ่ง</p>
              <p>คลิกวงกลม — เล็ง</p>
              <p>SPACE — ยิง</p>
            </div>
          </div>

          {/* =================================================
              GOAL MESSAGE
          ================================================= */}

          {goalMessage && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={`text-6xl font-black drop-shadow-2xl md:text-8xl ${
                  goalMessage === "GOAL!"
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                {goalMessage}
              </div>
            </div>
          )}

          {/* =================================================
              SHOOT BUTTON
          ================================================= */}

          <button
            onClick={shoot}
            disabled={
              !codeCorrect ||
              shooting
            }
            className={`absolute bottom-5 right-5 rounded-full px-8 py-5 text-lg font-black shadow-2xl transition active:scale-95 ${
              codeCorrect
                ? "bg-green-500 text-slate-950 hover:bg-green-400"
                : "cursor-not-allowed bg-slate-700 text-slate-400"
            }`}
          >
            {shooting
              ? "⚡ SHOOTING..."
              : codeCorrect
              ? "⚽ SHOOT"
              : "🔒 LOCKED"}
          </button>
        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">
            GAME STATUS
          </p>

          <p
            className={`mt-1 font-bold ${
              codeCorrect
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            {message}
          </p>
        </div>

        {/* =================================================
            MISSION + CODE
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Mission */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-green-400">
                  {mission.title}
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Coding Mission
                </h2>
              </div>

              <div className="rounded-xl bg-yellow-500/10 px-4 py-2 font-bold text-yellow-400">
                +50 XP
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-lg font-semibold">
                {mission.question}
              </p>
            </div>

            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeCorrect(false);
              }}
              spellCheck={false}
              className="mt-5 h-56 w-full resize-none rounded-2xl border border-slate-700 bg-black p-5 font-mono text-sm leading-6 text-green-300 outline-none focus:border-green-500"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={runCode}
                disabled={running}
                className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-green-400 disabled:opacity-50"
              >
                {running
                  ? "⏳ กำลังตรวจ..."
                  : "▶ ตรวจคำตอบ"}
              </button>

              <button
                onClick={resetCode}
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold transition hover:bg-slate-800"
              >
                ↻ Reset
              </button>

              <button
                onClick={nextMission}
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold transition hover:bg-slate-800"
              >
                Mission ถัดไป →
              </button>
            </div>
          </section>

          {/* Output */}
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-black">
                💻 Python Output
              </h2>

              <pre className="mt-4 min-h-36 overflow-auto rounded-2xl bg-black p-5 font-mono text-sm text-green-300">
                {output ||
                  "ยังไม่มี Output"}
              </pre>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-6">
              <h2 className="font-black text-yellow-400">
                💡 Hint
              </h2>

              <p className="mt-2 text-slate-300">
                {mission.hint}
              </p>
            </div>

            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6">
              <h2 className="font-black text-blue-400">
                🎯 วิธีทำประตู
              </h2>

              <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-slate-300">
                <li>
                  ตอบ Python ให้ถูก
                </li>
                <li>
                  เลือกจุดยิงที่ประตู
                </li>
                <li>
                  กด SPACE หรือ SHOOT
                </li>
                <li>
                  ลุ้นว่าจะผ่าน Keeper หรือไม่
                </li>
              </ol>
            </div>
          </section>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="py-8 text-center text-sm text-slate-500">
          ⚽ Football Coding Mission · Learn Python by Playing
        </footer>
      </main>
    </div>
  );
}